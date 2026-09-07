const {
  User,
  Appoints,
  MedicalRecord,
  Conversation,
  Message,
  Notification,
} = require("../models/db-models");
const { sendToUser } = require("../websocket/chatSocket");

// ─────────────────────────────────────────────────────────────
//  GET AUTHORIZED CONTACTS (My Doctors / My Patients)
// ─────────────────────────────────────────────────────────────
const getAuthorizedContacts = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = (req.user.role || "").toLowerCase();

    if (role === "patient") {
      // Find all doctors associated with patient through appointments
      const appointments = await Appoints.find({
        userId,
        doctorId: { $ne: null },
        status: { $in: ["assigned", "accepted", "completed"] },
      }).populate("doctorId", "username email specialty photo phone");

      const doctorMap = new Map();
      appointments.forEach((a) => {
        if (a.doctorId && a.doctorId._id && !doctorMap.has(String(a.doctorId._id))) {
          doctorMap.set(String(a.doctorId._id), {
            _id: a.doctorId._id,
            username: a.doctorId.username,
            email: a.doctorId.email,
            specialty: a.doctorId.specialty || "General Practitioner",
            phone: a.doctorId.phone,
            photo: a.doctorId.photo,
            role: "doctor",
            latestAppointmentReason: a.reason,
          });
        }
      });

      return res.json(Array.from(doctorMap.values()));
    } else if (role === "doctor") {
      // Find all patients assigned to this doctor
      const appointments = await Appoints.find({
        doctorId: userId,
        status: { $in: ["assigned", "accepted", "completed"] },
      }).populate("userId", "username email mrn dob phone gender photo");

      const patientMap = new Map();
      appointments.forEach((a) => {
        if (a.userId && a.userId._id && !patientMap.has(String(a.userId._id))) {
          patientMap.set(String(a.userId._id), {
            _id: a.userId._id,
            username: a.userId.username,
            email: a.userId.email,
            mrn: a.userId.mrn,
            gender: a.userId.gender,
            phone: a.userId.phone,
            photo: a.userId.photo,
            role: "patient",
            latestAppointmentReason: a.reason,
          });
        }
      });

      return res.json(Array.from(patientMap.values()));
    } else {
      return res.status(403).json({ message: "Only patients and doctors can access chat contacts" });
    }
  } catch (err) {
    console.error("Get chat contacts error:", err);
    res.status(500).json({ message: "Failed to load chat contacts" });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET ALL CONVERSATIONS FOR CURRENT USER
// ─────────────────────────────────────────────────────────────
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      $or: [{ patient: userId }, { doctor: userId }],
    })
      .populate("patient", "username email photo mrn gender role")
      .populate("doctor", "username email photo specialty role")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    // Calculate unread count for each conversation
    const result = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          recipient: userId,
          isRead: false,
        });
        return {
          ...conv.toObject(),
          unreadCount,
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ message: "Failed to load conversations" });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET OR CREATE CONVERSATION
// ─────────────────────────────────────────────────────────────
const getOrCreateConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user._id;
    const role = (req.user.role || "").toLowerCase();

    if (!recipientId) {
      return res.status(400).json({ message: "Recipient ID is required" });
    }

    let patientId;
    let doctorId;

    if (role === "patient") {
      patientId = currentUserId;
      doctorId = recipientId;
    } else if (role === "doctor") {
      doctorId = currentUserId;
      patientId = recipientId;
    } else {
      return res.status(403).json({ message: "Only patients and doctors can start conversations" });
    }

    // Verify appointment relationship
    const hasRelationship = await Appoints.exists({
      userId: patientId,
      doctorId: doctorId,
      status: { $in: ["assigned", "accepted", "completed"] },
    });

    if (!hasRelationship) {
      return res.status(403).json({
        message: "Access Denied: You can only communicate with authorized doctors/patients with an active or past appointment.",
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      patient: patientId,
      doctor: doctorId,
    })
      .populate("patient", "username email photo mrn gender role")
      .populate("doctor", "username email photo specialty role")
      .populate("lastMessage");

    if (!conversation) {
      conversation = new Conversation({
        patient: patientId,
        doctor: doctorId,
        lastMessageAt: new Date(),
      });
      await conversation.save();

      conversation = await Conversation.findById(conversation._id)
        .populate("patient", "username email photo mrn gender role")
        .populate("doctor", "username email photo specialty role");
    }

    res.json(conversation);
  } catch (err) {
    console.error("Get/create conversation error:", err);
    res.status(500).json({ message: "Failed to initialize conversation" });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET MESSAGES IN A CONVERSATION
// ─────────────────────────────────────────────────────────────
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Check authorization
    const isParticipant =
      String(conversation.patient) === String(userId) ||
      String(conversation.doctor) === String(userId);

    if (!isParticipant) {
      return res.status(403).json({ message: "Unauthorized: You are not a participant in this conversation" });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "username photo role")
      .populate("recipient", "username photo role")
      .populate({
        path: "replyTo",
        select: "text image messageType sender",
        populate: { path: "sender", select: "username role" },
      })
      .populate({
        path: "medicalRecord",
        populate: [
          { path: "doctor", select: "username specialty" },
          { path: "appointment", select: "reason appointmentDate type status" },
        ],
      })
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      { conversation: conversationId, recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    // Notify other participant of read receipt via WebSocket
    const otherParticipantId =
      String(conversation.patient) === String(userId)
        ? conversation.doctor
        : conversation.patient;

    sendToUser(otherParticipantId, "chat:messages_read", {
      conversationId,
      readBy: userId,
    });

    res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: "Failed to retrieve messages" });
  }
};

// ─────────────────────────────────────────────────────────────
//  SEND MESSAGE (Text, Image, or Medical Record)
// ─────────────────────────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const {
      conversationId,
      recipientId,
      messageType = "text",
      text,
      image,
      medicalRecordId,
      replyToId,
    } = req.body;

    const senderId = req.user._id;

    if (!conversationId || !recipientId) {
      return res.status(400).json({ message: "conversationId and recipientId are required" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Verify sender is participant
    const isParticipant =
      String(conversation.patient) === String(senderId) ||
      String(conversation.doctor) === String(senderId);

    if (!isParticipant) {
      return res.status(403).json({ message: "Unauthorized to send message in this conversation" });
    }

    // Verify medical record security if sharing a record
    if (messageType === "medical_record") {
      if (!medicalRecordId) {
        return res.status(400).json({ message: "medicalRecordId is required for medical record messages" });
      }

      const record = await MedicalRecord.findById(medicalRecordId);
      if (!record) {
        return res.status(404).json({ message: "Medical record not found" });
      }

      // Security check: Only the patient who owns the record can share it
      if (String(record.patient) !== String(senderId)) {
        return res.status(403).json({
          message: "Unauthorized: You can only share medical records that belong to your patient account",
        });
      }

      // Verify recipient is the authorized doctor
      if (String(conversation.doctor) !== String(recipientId)) {
        return res.status(403).json({
          message: "Unauthorized: Medical record can only be shared with the designated doctor",
        });
      }
    }

    const message = new Message({
      conversation: conversationId,
      sender: senderId,
      recipient: recipientId,
      messageType,
      text: text ? text.trim() : "",
      image: image || undefined,
      medicalRecord: medicalRecordId || undefined,
      replyTo: replyToId || undefined,
      reactions: [],
      isRead: false,
    });

    await message.save();

    // Update conversation lastMessage
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    // Fully populate message for broadcast and response
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username photo role")
      .populate("recipient", "username photo role")
      .populate({
        path: "replyTo",
        select: "text image messageType sender",
        populate: { path: "sender", select: "username role" },
      })
      .populate({
        path: "medicalRecord",
        populate: [
          { path: "doctor", select: "username specialty" },
          { path: "appointment", select: "reason appointmentDate type status" },
        ],
      });

    // Real-time WebSocket transmission to recipient and sender
    sendToUser(recipientId, "chat:new_message", populatedMessage);
    sendToUser(senderId, "chat:new_message", populatedMessage);

    // Optional notification
    try {
      const senderName = req.user.username || "Someone";
      const snippet =
        messageType === "medical_record"
          ? "Shared a medical record with you."
          : messageType === "image"
          ? "Sent you an image."
          : text.length > 50
          ? `${text.substring(0, 47)}...`
          : text;

      await Notification.create({
        recipient: recipientId,
        type: "appointment_booked", // reuse existing notification system
        message: `${senderName}: ${snippet}`,
      });
    } catch (notifErr) {
      console.warn("Notification non-critical failure:", notifErr.message);
    }

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: err.message || "Failed to send message" });
  }
};

// ─────────────────────────────────────────────────────────────
//  REACT TO MESSAGE (Emoji Reaction)
// ─────────────────────────────────────────────────────────────
const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    if (!emoji) {
      return res.status(400).json({ message: "Emoji is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const conversation = await Conversation.findById(message.conversation);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Verify user is participant
    const isParticipant =
      String(conversation.patient) === String(userId) ||
      String(conversation.doctor) === String(userId);

    if (!isParticipant) {
      return res.status(403).json({ message: "Unauthorized to react to this message" });
    }

    // Check if user already reacted with this emoji
    const existingIndex = message.reactions.findIndex(
      (r) => String(r.user) === String(userId) && r.emoji === emoji
    );

    if (existingIndex > -1) {
      // Toggle off
      message.reactions.splice(existingIndex, 1);
    } else {
      // Add reaction
      message.reactions.push({ user: userId, emoji });
    }

    await message.save();

    const payload = {
      messageId: message._id,
      conversationId: message.conversation,
      reactions: message.reactions,
    };

    // Broadcast reaction update over WebSocket in real time
    sendToUser(conversation.patient, "chat:reaction_updated", payload);
    sendToUser(conversation.doctor, "chat:reaction_updated", payload);

    res.json({ message: "Reaction updated", reactions: message.reactions });
  } catch (err) {
    console.error("React to message error:", err);
    res.status(500).json({ message: "Failed to update reaction" });
  }
};

module.exports = {
  getAuthorizedContacts,
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  reactToMessage,
};
