import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadPosts,
  removePost,
  postStatusToggled,
  selectAllPosts,
  selectPostsStatus,
} from '../store/postsSlice.js';
import { selectPlatformById } from '../store/platformsSlice.js';

function PostItem({ post }) {
  const dispatch = useDispatch();
  const platform = useSelector((state) => selectPlatformById(state, post.platformId));

  return (
    <li className="post-item">
      <div className="post-header">
        <strong>{post.title}</strong>
        <span className={`badge ${post.status}`}>{post.status}</span>
      </div>
      <p>{post.content}</p>
      <div className="post-meta">
        <span className="muted">{platform ? platform.name : 'Unknown platform'}</span>
        <div className="post-actions">
          <button onClick={() => dispatch(postStatusToggled(post.id))}>
            Toggle status
          </button>
          <button className="danger" onClick={() => dispatch(removePost(post.id))}>
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}

export default function PostList() {
  const dispatch = useDispatch();
  const posts = useSelector(selectAllPosts);
  const status = useSelector(selectPostsStatus);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadPosts());
    }
  }, [status, dispatch]);

  if (status === 'loading') return <p>Loading posts...</p>;
  if (status === 'failed') return <p>Failed to load posts.</p>;

  return (
    <div className="card">
      <h2>Posts ({posts.length})</h2>
      {posts.length === 0 ? (
        <p className="muted">No posts yet. Create one above.</p>
      ) : (
        <ul className="post-list">
          {posts.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </ul>
      )}
    </div>
  );
}
