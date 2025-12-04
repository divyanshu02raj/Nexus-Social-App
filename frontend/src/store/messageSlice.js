// src/store/messageSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const fetchConversations = createAsyncThunk(
  "messages/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/messages/conversations");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch conversations" });
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/messages/${userId}`);
      return { userId, messages: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch messages" });
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ receiverId, content, media }, { rejectWithValue }) => {
    try {
      let data;
      let headers = {};

      if (media) {
        data = new FormData();
        data.append('content', content || "");
        data.append('media', media);
      } else {
        data = { content };
      }

      const response = await api.post(`/messages/${receiverId}`, data, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to send message" });
    }
  }
);

export const addMessageToChat = createAsyncThunk(
  "messages/addMessageToChat",
  async (message, { rejectWithValue }) => {
    try {
      return message;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to add message" });
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  "messages/markMessagesAsRead",
  async (userId, { rejectWithValue }) => {
    try {
      await api.put(`/messages/read/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to mark messages as read" });
    }
  }
);

const messageSlice = createSlice({
  name: "messages",
  initialState: {
    conversations: { items: [], loading: false, error: null },
    activeChat: { userId: null, items: [], loading: false, error: null },
  },
  reducers: {
    clearActiveChat: (state) => {
      state.activeChat = { userId: null, items: [], loading: false, error: null };
    },
    updateMessage: (state, action) => {
      const { tempId, message } = action.payload;
      const index = state.activeChat.items.findIndex((m) => m._id === tempId);
      if (index !== -1) {
        state.activeChat.items[index] = message;
      }
    },
    removeMessage: (state, action) => {
      const tempId = action.payload;
      state.activeChat.items = state.activeChat.items.filter((m) => m._id !== tempId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.conversations.loading = true;
        state.conversations.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations.loading = false;
        state.conversations.items = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversations.loading = false;
        state.conversations.error = action.payload.message;
      });

    builder
      .addCase(fetchMessages.pending, (state) => {
        state.activeChat.loading = true;
        state.activeChat.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { userId, messages } = action.payload;
        state.activeChat = {
          userId,
          items: messages,
          loading: false,
          error: null,
        };
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.activeChat.loading = false;
        state.activeChat.error = action.payload.message;
      });

    builder.addCase(sendMessage.fulfilled, (state, action) => {
    });

    builder.addCase(addMessageToChat.fulfilled, (state, action) => {
      const message = action.payload;
      if (state.activeChat.userId === message.sender._id || state.activeChat.userId === message.receiver._id) {
        const exists = state.activeChat.items.find((m) => m._id === message._id);
        if (!exists) state.activeChat.items.push(message);
      }

      const convoIndex = state.conversations.items.findIndex(
        (c) => c.user._id === message.sender._id || c.user._id === message.receiver._id
      );
      if (convoIndex !== -1) {
        state.conversations.items[convoIndex].lastMessage = message;
      }
    }
    );

    builder.addCase(markMessagesAsRead.fulfilled, (state, action) => {
      const userId = action.payload;
      const convoIndex = state.conversations.items.findIndex(c => c.user._id === userId);
      if (convoIndex !== -1) {
        state.conversations.items[convoIndex].unreadCount = 0;
      }
    });
  },
});

export const { clearActiveChat, updateMessage, removeMessage } = messageSlice.actions;
export default messageSlice.reducer;
