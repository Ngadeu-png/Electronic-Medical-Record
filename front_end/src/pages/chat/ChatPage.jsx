import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchChatContacts,
  fetchConversations,
  openOrCreateConversation,
  fetchMessages,
  sendMessage,
  reactToMessage,
  clearCurrentConversation,
} from "../../redux/slices/chatSlice";
import useChatSocket from "../../utils/useChatSocket";
import MedicalRecordSelectorModal from "../../components/chat/MedicalRecordSelectorModal";
import MedicalRecordViewModal from "../../components/chat/MedicalRecordViewModal";
import {
  MessageSquare,
  Send,
  Image as ImageIcon,
  FileText,
  Smile,
  CornerUpLeft,
  X,
  Search,
  Check,
  CheckCheck,
  Stethoscope,
  User,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EMOJI_OPTIONS = ["👍", "❤️", "😊", "👏", "🙏", "😮"];

const ChatPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isPatient = (currentUser.role || "").toLowerCase() === "patient";

  const {
    contacts,
    contactsStatus,
    conversations,
    conversationsStatus,
    currentConversation,
    messages,
    messagesStatus,
    sendingStatus,
  } = useSelector((state) => state.chat);

  // WebSocket Connection Hook
  const { isConnected, sendTyping } = useChatSocket();

  // Component UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // base64 preview
  const [replyingTo, setReplyingTo] = useState(null); // message object
  const [activeReactionPickerMessageId, setActiveReactionPickerMessageId] = useState(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Modals
  const [isRecordSelectorOpen, setIsRecordSelectorOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // enlarged image modal

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch initial contacts and conversations on mount
  useEffect(() => {
    dispatch(fetchChatContacts());
    dispatch(fetchConversations());
  }, [dispatch]);

  // Handle URL query parameter auto-open: ?doctorId=... or ?patientId=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetRecipientId = isPatient
      ? params.get("doctorId")
      : params.get("patientId");

    if (targetRecipientId) {
      dispatch(openOrCreateConversation(targetRecipientId));
      setMobileShowChat(true);
    }
  }, [location.search, isPatient, dispatch]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Derive other participant of current conversation
  const otherParticipant = useMemo(() => {
    if (!currentConversation) return null;
    const isCurrentUserPatient =
      String(currentConversation.patient?._id) === String(currentUser._id);
    return isCurrentUserPatient
      ? currentConversation.doctor
      : currentConversation.patient;
  }, [currentConversation, currentUser._id]);

  // Filter contacts by search query
  const filteredContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => {
      const name = (c.username || "").toLowerCase();
      const spec = (c.specialty || "").toLowerCase();
      const mrn = (c.mrn || "").toLowerCase();
      return name.includes(q) || spec.includes(q) || mrn.includes(q);
    });
  }, [contacts, searchQuery]);

  // Select a contact to open conversation
  const handleSelectContact = (contactId) => {
    dispatch(openOrCreateConversation(contactId));
    setMobileShowChat(true);
    setReplyingTo(null);
    setSelectedImage(null);
    setInputText("");
  };

  // Image file handler
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("Image size should be under 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = null; // reset input
  };

  // Send Text / Image Message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!inputText.trim() && !selectedImage) || !currentConversation || !otherParticipant) {
      return;
    }

    const messageData = {
      conversationId: currentConversation._id,
      recipientId: otherParticipant._id,
      messageType: selectedImage ? "image" : "text",
      text: inputText.trim(),
      image: selectedImage || undefined,
      replyToId: replyingTo ? replyingTo._id : undefined,
    };

    setInputText("");
    setSelectedImage(null);
    setReplyingTo(null);

    await dispatch(sendMessage(messageData));
  };

  // Send Shared Medical Record
  const handleSendMedicalRecord = async (record) => {
    if (!currentConversation || !otherParticipant || !record) return;

    const messageData = {
      conversationId: currentConversation._id,
      recipientId: otherParticipant._id,
      messageType: "medical_record",
      medicalRecordId: record._id,
      text: `Shared Medical Record: ${record.noteType}`,
    };

    setIsRecordSelectorOpen(false);
    await dispatch(sendMessage(messageData));
  };

  // React to message
  const handleReact = (messageId, emoji) => {
    dispatch(reactToMessage({ messageId, emoji }));
    setActiveReactionPickerMessageId(null);
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-[calc(100vh-64px)] flex flex-col">
      {/* Top Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">
              {isPatient ? "Doctor Consultation Messages" : "Patient Clinical Messages"}
            </h1>
            <span
              className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                isConnected
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              {isConnected ? "Real-Time Active" : "Connecting..."}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Direct, real-time encrypted communication between assigned healthcare providers and patients.
          </p>
        </div>

        <button
          onClick={() => {
            dispatch(fetchChatContacts());
            dispatch(fetchConversations());
            if (currentConversation) {
              dispatch(fetchMessages(currentConversation._id));
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition shadow-xs self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[620px]">
        {/* ─────────────────────────────────────────────────────────────
            LEFT PANE: CONTACTS & CONVERSATIONS LIST
        ───────────────────────────────────────────────────────────── */}
        <div
          className={`w-full lg:w-80 border-r border-gray-200 flex flex-col bg-white ${
            mobileShowChat ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* List Title & Search */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                {isPatient ? "My Authorized Doctors" : "My Assigned Patients"}
              </h2>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                {contacts.length}
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={isPatient ? "Search doctors by name or specialty..." : "Search patients by name or MRN..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {contactsStatus === "loading" && contacts.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                Loading contacts...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12 px-4 text-xs text-gray-400">
                {searchQuery
                  ? "No contacts match your search."
                  : isPatient
                  ? "No assigned doctors found. You will be able to message doctors once hospital administration assigns an appointment."
                  : "No assigned patients found in your clinical schedule."}
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isActive =
                  currentConversation &&
                  (String(currentConversation.doctor?._id) === String(contact._id) ||
                    String(currentConversation.patient?._id) === String(contact._id));

                // Find if there's an existing conversation with unread count
                const conv = conversations.find(
                  (c) =>
                    String(c.doctor?._id) === String(contact._id) ||
                    String(c.patient?._id) === String(contact._id)
                );
                const unreadCount = conv?.unreadCount || 0;

                return (
                  <div
                    key={contact._id}
                    onClick={() => handleSelectContact(contact._id)}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition ${
                      isActive
                        ? "bg-purple-50/80 border-l-4 border-purple-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {contact.photo ? (
                          <img
                            src={contact.photo}
                            alt={contact.username}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          (contact.username || "U").charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-xs text-gray-800 truncate">
                          {isPatient ? `Dr. ${contact.username}` : contact.username}
                        </h3>
                        {unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                            {unreadCount}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-purple-700 font-medium truncate mt-0.5">
                        {contact.specialty ? contact.specialty : contact.mrn ? `MRN: ${contact.mrn}` : "Patient"}
                      </p>

                      {conv?.lastMessage?.text && (
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">
                          {conv.lastMessage.text}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            RIGHT PANE: ACTIVE CONVERSATION
        ───────────────────────────────────────────────────────────── */}
        <div
          className={`flex-1 flex flex-col bg-slate-50/30 ${
            !mobileShowChat ? "hidden lg:flex" : "flex"
          }`}
        >
          {currentConversation && otherParticipant ? (
            <>
              {/* Conversation Top Header */}
              <div className="p-3.5 sm:px-6 bg-white border-b border-gray-200 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setMobileShowChat(false)}
                    className="p-1.5 text-gray-500 hover:text-gray-800 lg:hidden rounded-lg hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {otherParticipant.photo ? (
                        <img
                          src={otherParticipant.photo}
                          alt={otherParticipant.username}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        (otherParticipant.username || "U").charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  <div>
                    <h2 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                      {isPatient ? `Dr. ${otherParticipant.username}` : otherParticipant.username}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {otherParticipant.role || "Practitioner"}
                      </span>
                    </h2>
                    <p className="text-[11px] text-gray-400">
                      {otherParticipant.specialty
                        ? otherParticipant.specialty
                        : otherParticipant.mrn
                        ? `MRN: ${otherParticipant.mrn}`
                        : "Authorized Consultation"}
                    </p>
                  </div>
                </div>

                {/* Patient Send Medical Record Quick Action */}
                {isPatient && (
                  <button
                    onClick={() => setIsRecordSelectorOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition shadow-xs"
                    title="Send an existing SOAP medical record to this doctor"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span className="hidden sm:inline">Send Medical Record</span>
                    <span className="sm:hidden">Record</span>
                  </button>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                {messagesStatus === "loading" && messages.length === 0 ? (
                  <div className="text-center py-16 text-xs text-gray-400">
                    Loading conversation messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16 text-xs text-gray-400 space-y-2">
                    <MessageSquare className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="font-semibold text-gray-600">Start of conversation</p>
                    <p className="text-gray-400 max-w-sm mx-auto">
                      Send a secure message, attach an image, or share a clinical consultation record.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = String(msg.sender?._id || msg.sender) === String(currentUser._id);
                    const hasReactions = msg.reactions && msg.reactions.length > 0;

                    // Group reactions by emoji
                    const reactionGroups = (msg.reactions || []).reduce((acc, r) => {
                      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                      return acc;
                    }, {});

                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"} group relative`}
                      >
                        {/* Message Bubble Container */}
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-xs relative ${
                            isMe
                              ? "bg-purple-600 text-white rounded-br-none"
                              : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                          }`}
                        >
                          {/* Reply Quote Banner */}
                          {msg.replyTo && (
                            <div
                              className={`p-2 rounded-xl mb-2 text-[11px] border-l-4 ${
                                isMe
                                  ? "bg-purple-700/60 border-purple-300 text-purple-100"
                                  : "bg-gray-100 border-purple-500 text-gray-600"
                              }`}
                            >
                              <span className="font-bold block">
                                ↳ Replying to {msg.replyTo.sender?.username || "Message"}:
                              </span>
                              <span className="line-clamp-1 italic">
                                {msg.replyTo.text || (msg.replyTo.image ? "[Image Attachment]" : "[Medical Record]")}
                              </span>
                            </div>
                          )}

                          {/* Message Content: Image */}
                          {msg.image && (
                            <div className="mb-2 rounded-xl overflow-hidden cursor-pointer">
                              <img
                                src={msg.image}
                                alt="Attachment"
                                onClick={() => setPreviewImage(msg.image)}
                                className="max-h-60 w-auto rounded-xl object-contain hover:opacity-95 transition"
                              />
                            </div>
                          )}

                          {/* Message Content: Medical Record Card */}
                          {msg.messageType === "medical_record" && (
                            <div
                              className={`p-3 rounded-xl mb-2 border ${
                                isMe
                                  ? "bg-purple-700/70 border-purple-400 text-white"
                                  : "bg-purple-50 border-purple-200 text-purple-900"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <FileText className="w-4 h-4 text-amber-300 flex-shrink-0" />
                                <span className="font-bold text-xs uppercase tracking-wider">
                                  Official Medical Record
                                </span>
                              </div>
                              <p className="font-semibold text-xs">
                                {msg.medicalRecord?.noteType || "Clinical Consultation Note"}
                              </p>
                              {msg.medicalRecord?.createdAt && (
                                <p className="text-[10px] opacity-80 mt-0.5">
                                  Filed on {new Date(msg.medicalRecord.createdAt).toLocaleDateString()}
                                </p>
                              )}
                              <button
                                onClick={() => setViewingRecord(msg.medicalRecord)}
                                className={`mt-2.5 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs ${
                                  isMe
                                    ? "bg-white text-purple-700 hover:bg-purple-50"
                                    : "bg-purple-600 text-white hover:bg-purple-700"
                                }`}
                              >
                                <ExternalLink className="w-3 h-3" />
                                View Medical Record
                              </button>
                            </div>
                          )}

                          {/* Message Content: Text */}
                          {msg.text && (
                            <p className="text-xs whitespace-pre-wrap leading-relaxed">
                              {msg.text}
                            </p>
                          )}

                          {/* Message Timestamp & Status Checkmark */}
                          <div
                            className={`flex items-center justify-end gap-1 text-[10px] mt-1.5 ${
                              isMe ? "text-purple-200" : "text-gray-400"
                            }`}
                          >
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isMe && (
                              <span>
                                {msg.isRead ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-300 inline" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 inline" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Reactions Display */}
                        {hasReactions && (
                          <div className="flex flex-wrap gap-1 mt-1 px-1">
                            {Object.entries(reactionGroups).map(([emoji, count]) => (
                              <button
                                key={emoji}
                                onClick={() => handleReact(msg._id, emoji)}
                                className="px-2 py-0.5 bg-white rounded-full border border-gray-200 text-[11px] shadow-xs flex items-center gap-1 hover:bg-gray-100 transition"
                              >
                                <span>{emoji}</span>
                                <span className="font-bold text-gray-700 text-[10px]">{count}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Hover Action Toolbar: Reply & React */}
                        <div
                          className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2 py-1 shadow-md z-10 ${
                            isMe ? "right-[100%] mr-2" : "left-[100%] ml-2"
                          }`}
                        >
                          {/* Reply Button */}
                          <button
                            onClick={() => setReplyingTo(msg)}
                            className="p-1 text-gray-500 hover:text-purple-600 rounded-lg hover:bg-gray-100 transition"
                            title="Reply to message"
                          >
                            <CornerUpLeft className="w-3.5 h-3.5" />
                          </button>

                          {/* Reaction Picker Button */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveReactionPickerMessageId(
                                  activeReactionPickerMessageId === msg._id ? null : msg._id
                                )
                              }
                              className="p-1 text-gray-500 hover:text-amber-500 rounded-lg hover:bg-gray-100 transition"
                              title="React to message"
                            >
                              <Smile className="w-3.5 h-3.5" />
                            </button>

                            {/* Floating Emoji Picker */}
                            {activeReactionPickerMessageId === msg._id && (
                              <div className="absolute bottom-full mb-1 left-0 bg-white border border-gray-200 rounded-2xl shadow-xl p-1.5 flex gap-1 z-30">
                                {EMOJI_OPTIONS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReact(msg._id, emoji)}
                                    className="p-1 text-sm hover:scale-125 transition-transform"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <div className="p-3.5 sm:p-4 bg-white border-t border-gray-200 space-y-2">
                {/* Quoted Reply Preview */}
                {replyingTo && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
                    <div className="flex items-center gap-2 truncate">
                      <CornerUpLeft className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="font-bold">Replying to {replyingTo.sender?.username || "User"}:</span>
                      <span className="truncate italic text-gray-600">
                        {replyingTo.text || (replyingTo.image ? "[Image Attachment]" : "[Medical Record]")}
                      </span>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="text-gray-400 hover:text-gray-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Image Attachment Preview */}
                {selectedImage && (
                  <div className="relative inline-block border border-gray-200 rounded-2xl p-1 bg-gray-50">
                    <img
                      src={selectedImage}
                      alt="Attachment Preview"
                      className="h-20 w-auto rounded-xl object-contain"
                    />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shadow-sm"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Text Input Row */}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  {/* Image Attachment Button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition"
                    title="Attach Image"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  {/* Input Box */}
                  <input
                    type="text"
                    placeholder="Type your secure message here..."
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      if (currentConversation && otherParticipant) {
                        sendTyping(currentConversation._id, otherParticipant._id, true);
                      }
                    }}
                    onBlur={() => {
                      if (currentConversation && otherParticipant) {
                        sendTyping(currentConversation._id, otherParticipant._id, false);
                      }
                    }}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={(!inputText.trim() && !selectedImage) || sendingStatus === "loading"}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Empty State when no conversation is selected */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-700 text-base">Select a conversation</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Choose {isPatient ? "a doctor from your care team" : "an assigned patient from your schedule"} on the left to start real-time messaging.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODALS
      ───────────────────────────────────────────────────────────── */}
      {/* Medical Record Selector Modal (For Patients) */}
      <MedicalRecordSelectorModal
        isOpen={isRecordSelectorOpen}
        onClose={() => setIsRecordSelectorOpen(false)}
        onSelectRecord={handleSendMedicalRecord}
        recipientDoctorName={otherParticipant?.username ? `Dr. ${otherParticipant.username}` : "your doctor"}
      />

      {/* Medical Record Full View Modal (For Doctors & Patients) */}
      <MedicalRecordViewModal
        isOpen={Boolean(viewingRecord)}
        onClose={() => setViewingRecord(null)}
        record={viewingRecord}
      />

      {/* Enlarged Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
        >
          <img
            src={previewImage}
            alt="Enlarged Attachment"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default ChatPage;
