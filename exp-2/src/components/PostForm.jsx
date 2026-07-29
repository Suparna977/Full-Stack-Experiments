import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPost } from '../store/postsSlice.js';
import { selectAllPlatforms } from '../store/platformsSlice.js';

export default function PostForm() {
  const dispatch = useDispatch();
  const platforms = useSelector(selectAllPlatforms);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platformId, setPlatformId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Platforms load asynchronously, so sync the default selection
  // once they actually arrive (initial useState runs before that).
  useEffect(() => {
    if (!platformId && platforms.length > 0) {
      setPlatformId(platforms[0].id);
    }
  }, [platforms, platformId]);

  const canSubmit = title.trim() && content.trim() && platformId && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    await dispatch(addPost({ title, content, platformId }));
    setSubmitting(false);
    setTitle('');
    setContent('');
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Create Post</h2>
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
      </label>
      <label>
        Content
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What do you want to say?"
          rows={3}
        />
      </label>
      <label>
        Platform
        <select value={platformId} onChange={(e) => setPlatformId(e.target.value)}>
          {platforms.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={!canSubmit}>
        {submitting ? 'Saving...' : 'Add Post'}
      </button>
    </form>
  );
}