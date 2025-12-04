// src/store.js
import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from './services/api';
import messageReducer from './store/messageSlice';
import userReducer from './store/userSlice';


const savedTheme = localStorage.getItem('theme') === 'dark';
if (savedTheme) {
  document.documentElement.classList.add('dark');
}
const themeSlice = createSlice({
  name: 'theme',
  initialState: { darkMode: savedTheme },
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('theme', state.darkMode ? 'dark' : 'light');
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
  },
});


const savedUser = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;
const savedToken = localStorage.getItem('token') || null;

const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: savedUser, token: savedToken, loading: false, error: null },
  reducers: {
    setUserAndToken: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    updateFollowing: (state, action) => {
      const { userId, follow } = action.payload;
      if (state.user) {
        if (follow) {
          state.user.following.push(userId);
        } else {
          state.user.following = state.user.following.filter((id) => id !== userId);
        }
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    updateSavedPosts: (state, action) => {
      const { postId } = action.payload;
      if (state.user) {
        const index = state.user.savedPosts.indexOf(postId);
        if (index >= 0) {
          state.user.savedPosts.splice(index, 1);
        } else {
          state.user.savedPosts.push(postId);
        }
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Failed to update profile';
      });
  },
});

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.put('/users/password', { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// --- Posts Slice ---
const fetchPosts = createAsyncThunk('posts/fetchPosts', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/posts');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});
const createNewPost = createAsyncThunk(
  'posts/createNewPost',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const toggleLike = createAsyncThunk('posts/toggleLike', async (postId, { rejectWithValue }) => {
  try {
    const response = await api.put(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});
const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, text }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/comments`, { text });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const deletePost = createAsyncThunk('posts/deletePost', async (postId, { rejectWithValue }) => {
  try {
    await api.delete(`/posts/${postId}`);
    return postId;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});
const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, text }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/posts/${postId}`, { text });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const fetchTrendingPosts = createAsyncThunk(
  'posts/fetchTrendingPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/posts/trending');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const fetchSinglePost = createAsyncThunk(
  'posts/fetchSinglePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [],
    loading: false,
    error: null,
    trending: { items: [], loading: false, error: null },
    currentPost: { item: null, loading: false, error: null },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(fetchTrendingPosts.pending, (state) => {
        state.trending.loading = true;
        state.trending.error = null;
      })
      .addCase(fetchTrendingPosts.fulfilled, (state, action) => {
        state.trending.loading = false;
        state.trending.items = action.payload;
      })
      .addCase(fetchTrendingPosts.rejected, (state, action) => {
        state.trending.loading = false;
        state.trending.error = action.payload.message;
      })

      .addCase(fetchSinglePost.pending, (state) => {
        state.currentPost.loading = true;
        state.currentPost.error = null;
        state.currentPost.item = null;
      })
      .addCase(fetchSinglePost.fulfilled, (state, action) => {
        state.currentPost.loading = false;
        state.currentPost.item = action.payload;
      })
      .addCase(fetchSinglePost.rejected, (state, action) => {
        state.currentPost.loading = false;
        state.currentPost.error = action.payload.message || 'Failed to fetch post';
      })
      .addCase(createNewPost.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const index = state.items.findIndex((p) => p._id === updatedPost._id);
        if (index !== -1) {
          state.items[index] = updatedPost;
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const index = state.items.findIndex((p) => p._id === updatedPost._id);
        if (index !== -1) {
          state.items[index] = updatedPost;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.items = state.items.filter((post) => post._id !== action.payload);
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const index = state.items.findIndex((p) => p._id === updatedPost._id);
        if (index !== -1) {
          state.items[index] = updatedPost;
        }
      });
  },
});


const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const followProfileUser = createAsyncThunk(
  'profile/followUser',
  async (userId, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${userId}/follow`);
      const { status } = response.data;
      const { id: currentUserId } = getState().auth.user;

      if (status === 'following') {
        dispatch(authSlice.actions.updateFollowing({ userId, follow: true }));
      }

      return { followedUserId: userId, currentUserId, status };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const unfollowProfileUser = createAsyncThunk(
  'profile/unfollowUser',
  async (userId, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${userId}/unfollow`);
      const { status } = response.data;
      const { id: currentUserId } = getState().auth.user;

      if (status === 'none') {
        dispatch(authSlice.actions.updateFollowing({ userId, follow: false }));
      }

      return { unfollowedUserId: userId, currentUserId, status };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const profileSlice = createSlice({
  name: 'profile',
  initialState: { loading: false, error: null, data: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.data = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Failed to fetch profile';
      })
      .addCase(followProfileUser.fulfilled, (state, action) => {
        if (state.data && (state.data.user._id === action.payload.followedUserId || state.data.user.id === action.payload.followedUserId)) {
          if (action.payload.status === 'following') {
            state.data.user.followers.push(action.payload.currentUserId);
            state.data.connectionStatus = 'following';
          } else if (action.payload.status === 'requested') {
            state.data.connectionStatus = 'requested';
          }
        }
      })
      .addCase(unfollowProfileUser.fulfilled, (state, action) => {
        if (state.data && (state.data.user._id === action.payload.unfollowedUserId || state.data.user.id === action.payload.unfollowedUserId)) {
          if (action.payload.status === 'none') {
            state.data.user.followers = state.data.user.followers.filter(
              (id) => id !== action.payload.currentUserId
            );
          }

          state.data.connectionStatus = 'none';
        }
      });
  },
});

const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.put('/notifications/read');
      return;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const fetchFollowRequests = createAsyncThunk(
  'notifications/fetchRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/requests');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const acceptFollowRequest = createAsyncThunk(
  'notifications/acceptRequest',
  async (userId, { rejectWithValue }) => {
    try {
      await api.put(`/users/${userId}/accept-follow`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const rejectFollowRequest = createAsyncThunk(
  'notifications/rejectRequest',
  async (userId, { rejectWithValue }) => {
    try {
      await api.put(`/users/${userId}/reject-follow`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], requests: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Failed to fetch notifications';
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.items.forEach((item) => {
          item.read = true;
        });
      })
      .addCase(fetchFollowRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
      })
      .addCase(acceptFollowRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter((req) => req._id !== action.payload);
      })
      .addCase(rejectFollowRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter((req) => req._id !== action.payload);
      });
  },
});

// --- Saved Posts Slice ---
const fetchSavedPosts = createAsyncThunk(
  'savedPosts/fetchSaved',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/posts/saved');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const toggleSavePost = createAsyncThunk(
  'posts/toggleSave',
  async (postId, { dispatch, rejectWithValue }) => {
    try {
      await api.put(`/posts/${postId}/save`);
      dispatch(authSlice.actions.updateSavedPosts({ postId }));
      return postId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const savedPostsSlice = createSlice({
  name: 'savedPosts',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavedPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSavedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Failed to fetch saved posts';
      })
      .addCase(toggleSavePost.fulfilled, (state, action) => {
        state.items = state.items.filter((post) => post._id !== action.payload);
      });
  },
});

const searchUsers = createAsyncThunk(
  'search/searchUsers',
  async (query, { rejectWithValue }) => {
    if (!query) return [];
    try {
      const response = await api.get(`/users/search?q=${query}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const searchSlice = createSlice({
  name: 'search',
  initialState: { results: [], loading: false, error: null },
  reducers: {
    clearSearchResults: (state) => {
      state.results = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Search failed';
      });
  },
});

const fetchStories = createAsyncThunk(
  'stories/fetchStories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/stories');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const createStory = createAsyncThunk(
  'stories/createStory',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const deleteStory = createAsyncThunk(
  'stories/deleteStory',
  async (storyId, { rejectWithValue }) => {
    try {
      await api.delete(`/stories/${storyId}`);
      return storyId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const viewStory = createAsyncThunk(
  'stories/viewStory',
  async (storyId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/stories/${storyId}/view`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const likeStory = createAsyncThunk(
  'stories/likeStory',
  async (storyId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/stories/${storyId}/like`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const storiesSlice = createSlice({
  name: 'stories',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchStories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Failed to fetch stories';
      })
      .addCase(createStory.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteStory.fulfilled, (state, action) => {
        state.items = state.items.filter((story) => story._id !== action.payload);
      })
      .addCase(viewStory.fulfilled, (state, action) => {
        const index = state.items.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(likeStory.fulfilled, (state, action) => {
        const index = state.items.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});


export const { toggleTheme } = themeSlice.actions;
export const { setUserAndToken, logout, updateFollowing, updateSavedPosts } = authSlice.actions;
export { fetchPosts, createNewPost, toggleLike, addComment, toggleSavePost, deletePost, updatePost, updateUserProfile, fetchTrendingPosts, fetchSinglePost };
export { fetchUserProfile, followProfileUser, unfollowProfileUser };
export { fetchNotifications, markAllNotificationsAsRead, fetchFollowRequests, acceptFollowRequest, rejectFollowRequest };
export { fetchSavedPosts };
export { fetchStories, createStory, deleteStory, viewStory, likeStory };
export const { clearSearchResults } = searchSlice.actions;
export { searchUsers };

const store = configureStore({
  reducer: {
    theme: themeSlice.reducer,
    auth: authSlice.reducer,
    posts: postsSlice.reducer,
    profile: profileSlice.reducer,
    notifications: notificationsSlice.reducer,
    stories: storiesSlice.reducer,
    savedPosts: savedPostsSlice.reducer,
    messages: messageReducer,
    search: searchSlice.reducer,
    user: userReducer, 
  },
});

export default store;
