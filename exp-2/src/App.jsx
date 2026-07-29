import React from 'react';
import PlatformList from './components/PlatformList.jsx';
import PostForm from './components/PostForm.jsx';
import PostList from './components/PostList.jsx';

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>Centralized State Management with Redux Toolkit</h1>
        <p className="muted"></p>
      </header>
      <main className="grid">
        <div className="col">
          <PlatformList />
          <PostForm />
        </div>
        <div className="col">
          <PostList />
        </div>
      </main>
    </div>
  );
}
