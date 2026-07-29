# Experiment 1.2.1 — Centralized State Management using Redux Toolkit

## Aim
To design and implement a centralized state management system using Redux Toolkit for managing posts and platform-related data.

## Objectives
- Understand the concept of global state management
- Implement Redux Toolkit for scalable state handling
- Design a normalized state structure
- Manage asynchronous data flows via a mock API

## COs Mapped
CO1 - BT1, CO2 - BT2, CO3 - BT3

## Software Requirements
- Node.js & npm
- React.js (via Vite)
- Redux Toolkit (`@reduxjs/toolkit`)
- React-Redux (`react-redux`)
- VS Code

## Project Structure
```
redux-toolkit-lab/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx              # Entry point, wraps App in <Provider>
    ├── App.jsx                # Root component / layout
    ├── index.css
    ├── api/
    │   └── mockApi.js         # Simulated backend (setTimeout-based delay)
    ├── store/
    │   ├── store.js           # configureStore() — combines reducers
    │   ├── postsSlice.js      # Posts slice: normalized state + CRUD thunks
    │   └── platformsSlice.js  # Platforms slice: normalized state + fetch thunk
    └── components/
        ├── PlatformList.jsx
        ├── PostForm.jsx
        └── PostList.jsx
```

## Implementation Summary

### 1. Store Configuration (`store.js`)
`configureStore()` combines the `posts` and `platforms` reducers into a single store, giving the global state shape:
```js
{
  posts:     { byId: {...}, allIds: [...], status, error },
  platforms: { byId: {...}, allIds: [...], status, error }
}
```

### 2. State Normalization
Instead of storing posts/platforms as flat arrays, each slice keeps:
- `byId`: an object map of `id -> entity` (O(1) lookup, no duplication)
- `allIds`: an ordered array of ids (defines list order)

This mirrors a relational table design (similar to normalized database rows), which avoids redundant nested data and makes updates/deletes cheap.

### 3. Slices (`createSlice`)
- **`postsSlice.js`** — defines the `posts` reducer, a synchronous reducer (`postStatusToggled`) for local UI-only changes, and `extraReducers` that respond to async thunk lifecycle actions (`pending` / `fulfilled` / `rejected`).
- **`platformsSlice.js`** — defines the `platforms` reducer and handles the `loadPlatforms` thunk lifecycle.

### 4. Asynchronous Data Flow (`createAsyncThunk`)
Each thunk (`loadPosts`, `addPost`, `editPost`, `removePost`, `loadPlatforms`) calls into `mockApi.js`, which simulates network latency using `setTimeout`-wrapped promises. Redux Toolkit auto-dispatches `pending`, `fulfilled`, and `rejected` actions for each thunk, which the slice's `extraReducers` use to update `status`/`error` and the normalized entities.

### 5. CRUD Operations
| Operation | Thunk / Reducer | Effect |
|---|---|---|
| Create | `addPost` | Adds new post to `byId` and `allIds` |
| Read | `loadPosts`, `loadPlatforms` | Populates state from mock API on mount |
| Update | `editPost`, `postStatusToggled` | Merges changes into `byId[id]` |
| Delete | `removePost` | Removes from `byId` and filters `allIds` |

### 6. Connecting Components (`react-redux` hooks)
- `useSelector` reads normalized data via selector functions (e.g. `selectAllPosts`, `selectPlatformById`) — this keeps components decoupled from the raw state shape.
- `useDispatch` dispatches thunks/actions from `PostForm.jsx` and `PostList.jsx` without any prop drilling from `App.jsx`.

## Expected Outcome (Achieved)
- ✅ Centralized Redux store implemented with `configureStore`
- ✅ Posts and platforms managed as normalized entities
- ✅ Prop drilling eliminated — components read/write state directly via hooks
- ✅ Async CRUD flows implemented using `createAsyncThunk` against a mock API
- ✅ Scalable structure: new slices/entities can be added without touching existing ones

## How to Run
See the step-by-step setup instructions provided separately (or in the chat response). In short:
```
npm install
npm run dev
```
Then open the local URL shown in the terminal (typically `http://localhost:5173`).

## Conclusion
This experiment demonstrates how Redux Toolkit reduces boilerplate compared to traditional Redux while enforcing a predictable, normalized, and scalable state architecture. Global state (posts, platforms) is now managed centrally and updated through well-defined actions/reducers, with asynchronous flows handled cleanly via `createAsyncThunk`.
