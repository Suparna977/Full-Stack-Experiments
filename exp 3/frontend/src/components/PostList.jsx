import React, { useEffect, useState, useCallback } from 'react';
import { postsApi } from '../api';
import { useAuth } from '../context/AuthContext.jsx';

const PERMISSIONS = {
  admin: { create: true, update: true, delete: true },
  editor: { create: false, update: true, delete: false },
  viewer: { create: false, update: false, delete: false },
};

function permissionNote(role) {
  switch (role) {
    case 'admin':
      return 'You are signed in as Admin — you can create, update, delete, and view posts.';
    case 'editor':
      return 'You are signed in as Editor — you can view and update posts.';
    case 'viewer':
      return 'You are signed in as Viewer — you have read-only access to posts.';
    default:
      return '';
  }
}

export default function PostList() {
  const { token, user, logout } = useAuth();
  const perms = PERMISSIONS[user?.role] || PERMISSIONS.viewer;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postsApi.getAll(token);
      setPosts(data.posts);
    } catch (err) {
      if (err.status === 401) {
        showToast('Session expired. Please log in again.', true);
        logout();
      } else {
        showToast(err.message, true);
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      await postsApi.create(token, { title: newTitle, content: newContent });
      setNewTitle('');
      setNewContent('');
      setShowNewForm(false);
      showToast('Post created.');
      loadPosts();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  function startEdit(post) {
    setEditingId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  }

  async function handleUpdate(e, id) {
    e.preventDefault();
    try {
      await postsApi.update(token, id, { title: editTitle, content: editContent });
      setEditingId(null);
      showToast('Post updated.');
      loadPosts();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await postsApi.remove(token, id);
      showToast('Post deleted.');
      loadPosts();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  return (
    <div className="main-content">
      <div className="permission-note">{permissionNote(user?.role)}</div>

      <div className="section-header">
        <h3>Posts</h3>
        {perms.create && (
          <button className="btn-new-post" onClick={() => setShowNewForm((s) => !s)}>
            {showNewForm ? 'Cancel' : '+ New Post'}
          </button>
        )}
      </div>

      {showNewForm && perms.create && (
        <form className="post-form" onSubmit={handleCreate}>
          <input
            placeholder="Post title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="What's happening?"
            rows={3}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            required
          />
          <div className="post-form-actions">
            <button className="btn-primary" type="submit" style={{ width: 'auto', padding: '8px 16px' }}>
              Publish
            </button>
            <button className="btn-secondary" type="button" onClick={() => setShowNewForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loader">Loading posts…</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">No posts yet.</div>
      ) : (
        posts.map((post) => (
          <div className="post-card" key={post.id}>
            {editingId === post.id ? (
              <form onSubmit={(e) => handleUpdate(e, post.id)}>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                <textarea
                  rows={3}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  required
                />
                <div className="post-form-actions">
                  <button className="btn-primary" type="submit" style={{ width: 'auto', padding: '8px 16px' }}>
                    Save
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="post-card-header">
                  <div>
                    <h4>{post.title}</h4>
                  </div>
                  <div className="post-actions">
                    {perms.update && (
                      <button className="icon-btn edit" onClick={() => startEdit(post)}>
                        Edit
                      </button>
                    )}
                    {perms.delete && (
                      <button className="icon-btn delete" onClick={() => handleDelete(post.id)}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <p className="content">{post.content}</p>
                <div className="post-meta">
                  by @{post.author} · {new Date(post.createdAt).toLocaleString()}
                  {post.updatedAt ? ' · edited' : ''}
                </div>
              </>
            )}
          </div>
        ))
      )}

      {toast && <div className={`toast ${toast.isError ? 'error' : ''}`}>{toast.message}</div>}
    </div>
  );
}
