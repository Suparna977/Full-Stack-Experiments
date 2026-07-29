import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './postsSlice.js';
import platformsReducer from './platformsSlice.js';

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    platforms: platformsReducer,
  },
});

// Resulting global state shape:
// {
//   posts: { byId: {...}, allIds: [...], status, error },
//   platforms: { byId: {...}, allIds: [...], status, error }
// }
