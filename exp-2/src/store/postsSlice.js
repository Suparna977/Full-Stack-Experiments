import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPosts, createPost, updatePost, deletePost } from '../api/mockApi.js';

// ---- Async Thunks (async data flow via mock API) ----

export const loadPosts = createAsyncThunk('posts/loadPosts', async () => {
  const posts = await fetchPosts();
  return posts;
});

export const addPost = createAsyncThunk('posts/addPost', async (newPost) => {
  const post = await createPost(newPost);
  return post;
});

export const editPost = createAsyncThunk(
  'posts/editPost',
  async ({ id, changes }) => {
    const post = await updatePost(id, changes);
    return post;
  }
);

export const removePost = createAsyncThunk('posts/removePost', async (id) => {
  await deletePost(id);
  return id;
});

// ---- Normalized initial state ----
const initialState = {
  byId: {},
  allIds: [],
  status: 'idle',
  error: null,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Synchronous local-only reducer example (no API round trip needed)
    postStatusToggled(state, action) {
      const post = state.byId[action.payload];
      if (post) {
        post.status = post.status === 'draft' ? 'published' : 'draft';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // READ
      .addCase(loadPosts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.byId = {};
        state.allIds = [];
        action.payload.forEach((post) => {
          state.byId[post.id] = post;
          state.allIds.push(post.id);
        });
      })
      .addCase(loadPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      // CREATE
      .addCase(addPost.fulfilled, (state, action) => {
        const post = action.payload;
        state.byId[post.id] = post;
        state.allIds.push(post.id);
      })

      // UPDATE
      .addCase(editPost.fulfilled, (state, action) => {
        const post = action.payload;
        state.byId[post.id] = { ...state.byId[post.id], ...post };
      })

      // DELETE
      .addCase(removePost.fulfilled, (state, action) => {
        const id = action.payload;
        delete state.byId[id];
        state.allIds = state.allIds.filter((postId) => postId !== id);
      });
  },
});

export const { postStatusToggled } = postsSlice.actions;
export default postsSlice.reducer;

// ---- Selectors ----
export const selectAllPosts = (state) =>
  state.posts.allIds.map((id) => state.posts.byId[id]);
export const selectPostById = (state, id) => state.posts.byId[id];
export const selectPostsStatus = (state) => state.posts.status;
export const selectPostsByPlatform = (state, platformId) =>
  state.posts.allIds
    .map((id) => state.posts.byId[id])
    .filter((post) => post.platformId === platformId);
