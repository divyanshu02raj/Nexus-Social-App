//frontend\src\store\userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const fetchConnections = createAsyncThunk(
  "user/fetchConnections",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/connections");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch connections" });
    }
  }
);

export const fetchSuggestedUsers = createAsyncThunk(
  "user/fetchSuggestedUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/suggested");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch suggested users" });
    }
  }
);

export const fetchUserFollowers = createAsyncThunk(
  "user/fetchUserFollowers",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/followers`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch followers" });
    }
  }
);

export const fetchUserFollowing = createAsyncThunk(
  "user/fetchUserFollowing",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/following`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch following" });
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    selectedUser: null,
    connections: { items: [], loading: false, error: null },
    suggestedUsers: { items: [], loading: false, error: null },
    followers: { items: [], loading: false, error: null },
    following: { items: [], loading: false, error: null },
    onlineUsers: [],
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConnections.pending, (state) => {
        state.connections.loading = true;
        state.connections.error = null;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.connections.loading = false;
        state.connections.items = action.payload;
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.connections.loading = false;
        state.connections.error = action.payload.message;
      })
      .addCase(fetchSuggestedUsers.pending, (state) => {
        state.suggestedUsers.loading = true;
        state.suggestedUsers.error = null;
      })
      .addCase(fetchSuggestedUsers.fulfilled, (state, action) => {
        state.suggestedUsers.loading = false;
        state.suggestedUsers.items = action.payload;
      })
      .addCase(fetchSuggestedUsers.rejected, (state, action) => {
        state.suggestedUsers.loading = false;
        state.suggestedUsers.error = action.payload.message;
      })
      .addCase(fetchUserFollowers.pending, (state) => {
        state.followers.loading = true;
        state.followers.error = null;
      })
      .addCase(fetchUserFollowers.fulfilled, (state, action) => {
        state.followers.loading = false;
        state.followers.items = action.payload;
      })
      .addCase(fetchUserFollowers.rejected, (state, action) => {
        state.followers.loading = false;
        state.followers.error = action.payload.message;
      })
      .addCase(fetchUserFollowing.pending, (state) => {
        state.following.loading = true;
        state.following.error = null;
      })
      .addCase(fetchUserFollowing.fulfilled, (state, action) => {
        state.following.loading = false;
        state.following.items = action.payload;
      })
      .addCase(fetchUserFollowing.rejected, (state, action) => {
        state.following.loading = false;
        state.following.error = action.payload.message;
      });
  },
});

export const { setSelectedUser, clearSelectedUser, setOnlineUsers } = userSlice.actions;
export default userSlice.reducer;
