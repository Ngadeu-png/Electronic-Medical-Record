import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chatApi from "../../api/chatApi";

// Fetch contacts (My Doctors for patient, My Patients for doctor)
export const fetchChatContacts = createAsyncThunk(
  "chat/fetchChatContacts",
  async (_, { rejectWithValue }) => {
    try {
      return await chatApi.getContacts();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Fetch all active conversations
export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      return await chatApi.getConversations();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Open or create conversation with recipient
export const openOrCreateConversation = createAsyncThunk(
  "chat/openOrCreateConversation",
  async (recipientId, { dispatch, rejectWithValue }) => {
    try {
      const conv = await chatApi.getOrCreateConversation(recipientId);
      dispatch(fetchMessages(conv._id));
      return conv;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Fetch messages for a conversation
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      return await chatApi.getMessages(conversationId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Send message (text, image, or medical record)
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (messageData, { rejectWithValue }) => {
    try {
      return await chatApi.sendMessage(messageData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// React to message
export const reactToMessage = createAsyncThunk(
  "chat/reactToMessage",
  async ({ messageId, emoji }, { rejectWithValue }) => {
    try {
      const res = await chatApi.reactToMessage(messageId, emoji);
      return { messageId, reactions: res.reactions };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  contacts: [],
  contactsStatus: "idle",

  conversations: [],
  conversationsStatus: "idle",

  currentConversation: null,

  messages: [],
  messagesStatus: "idle",

  sendingStatus: "idle",
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    // Real-time message dispatch handler
    addIncomingMessage: (state, action) => {
      const message = action.payload;
      if (!message || !message._id) return;

      // If belongs to current active conversation, append
      if (
        state.currentConversation &&
        String(state.currentConversation._id) === String(message.conversation)
      ) {
        const exists = state.messages.some((m) => String(m._id) === String(message._id));
        if (!exists) {
          state.messages.push(message);
        }
      }

      // Update conversations list (lastMessage & order)
      const convIndex = state.conversations.findIndex(
        (c) => String(c._id) === String(message.conversation)
      );

      if (convIndex > -1) {
        const conv = state.conversations[convIndex];
        conv.lastMessage = message;
        conv.lastMessageAt = message.createdAt;

        // Bump unread if not the currently open conversation
        if (
          !state.currentConversation ||
          String(state.currentConversation._id) !== String(message.conversation)
        ) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }

        // Move to top
        state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conv);
      }
    },
    // Real-time reaction update
    updateMessageReaction: (state, action) => {
      const { messageId, reactions } = action.payload;
      const msg = state.messages.find((m) => String(m._id) === String(messageId));
      if (msg) {
        msg.reactions = reactions;
      }
    },
    markConversationRead: (state, action) => {
      const conversationId = action.payload;
      const conv = state.conversations.find(
        (c) => String(c._id) === String(conversationId)
      );
      if (conv) {
        conv.unreadCount = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchChatContacts
      .addCase(fetchChatContacts.pending, (state) => {
        state.contactsStatus = "loading";
      })
      .addCase(fetchChatContacts.fulfilled, (state, action) => {
        state.contactsStatus = "succeeded";
        state.contacts = action.payload;
      })
      .addCase(fetchChatContacts.rejected, (state, action) => {
        state.contactsStatus = "failed";
        state.error = action.payload;
      })

      // fetchConversations
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsStatus = "loading";
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsStatus = "succeeded";
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationsStatus = "failed";
        state.error = action.payload;
      })

      // openOrCreateConversation
      .addCase(openOrCreateConversation.fulfilled, (state, action) => {
        state.currentConversation = action.payload;
        // Reset unread count for this conversation
        const conv = state.conversations.find(
          (c) => String(c._id) === String(action.payload._id)
        );
        if (conv) conv.unreadCount = 0;
      })

      // fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.messagesStatus = "loading";
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesStatus = "succeeded";
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesStatus = "failed";
        state.error = action.payload;
      })

      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.sendingStatus = "loading";
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingStatus = "succeeded";
        // Ensure message is added if not already added by socket
        const exists = state.messages.some(
          (m) => String(m._id) === String(action.payload._id)
        );
        if (!exists) {
          state.messages.push(action.payload);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingStatus = "failed";
        state.error = action.payload;
      })

      // reactToMessage
      .addCase(reactToMessage.fulfilled, (state, action) => {
        const msg = state.messages.find(
          (m) => String(m._id) === String(action.payload.messageId)
        );
        if (msg) {
          msg.reactions = action.payload.reactions;
        }
      });
  },
});

export const {
  setCurrentConversation,
  clearCurrentConversation,
  addIncomingMessage,
  updateMessageReaction,
  markConversationRead,
} = chatSlice.actions;

export default chatSlice.reducer;
