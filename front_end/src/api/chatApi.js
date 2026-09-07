import { BASE_URL, getAuthHeaders, handleApiResponse } from "./global";

export const chatApi = {
  // Get authorized chat contacts (My Doctors for patient, My Patients for doctor)
  getContacts: async () => {
    const res = await fetch(`${BASE_URL}/chat/contacts`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(res);
  },

  // Get all active conversations for the current user
  getConversations: async () => {
    const res = await fetch(`${BASE_URL}/chat/conversations`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(res);
  },

  // Find or create a conversation with a specific doctor/patient
  getOrCreateConversation: async (recipientId) => {
    const res = await fetch(`${BASE_URL}/chat/conversations`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ recipientId }),
    });
    return handleApiResponse(res);
  },

  // Get messages for a conversation
  getMessages: async (conversationId) => {
    const res = await fetch(`${BASE_URL}/chat/conversations/${conversationId}/messages`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(res);
  },

  // Send a message (text, image, or medical record)
  sendMessage: async (messageData) => {
    const res = await fetch(`${BASE_URL}/chat/messages`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(messageData),
    });
    return handleApiResponse(res);
  },

  // React to a message
  reactToMessage: async (messageId, emoji) => {
    const res = await fetch(`${BASE_URL}/chat/messages/${messageId}/react`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ emoji }),
    });
    return handleApiResponse(res);
  },
};

export default chatApi;
