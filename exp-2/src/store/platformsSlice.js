import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPlatforms } from '../api/mockApi.js';

// Normalized shape: { byId: { id: entity }, allIds: [id, id, ...] }
// This avoids nested arrays, prevents duplication, and gives O(1) lookups
// by id instead of scanning an array (similar to a relational table).

export const loadPlatforms = createAsyncThunk(
  'platforms/loadPlatforms',
  async () => {
    const platforms = await fetchPlatforms();
    return platforms;
  }
);

const initialState = {
  byId: {},
  allIds: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const platformsSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadPlatforms.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadPlatforms.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.byId = {};
        state.allIds = [];
        action.payload.forEach((platform) => {
          state.byId[platform.id] = platform;
          state.allIds.push(platform.id);
        });
      })
      .addCase(loadPlatforms.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default platformsSlice.reducer;

// Selectors
export const selectAllPlatforms = (state) =>
  state.platforms.allIds.map((id) => state.platforms.byId[id]);
export const selectPlatformById = (state, id) => state.platforms.byId[id];
export const selectPlatformsStatus = (state) => state.platforms.status;
