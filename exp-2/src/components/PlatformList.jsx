import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadPlatforms, selectAllPlatforms, selectPlatformsStatus } from '../store/platformsSlice.js';

export default function PlatformList() {
  const dispatch = useDispatch();
  const platforms = useSelector(selectAllPlatforms);
  const status = useSelector(selectPlatformsStatus);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadPlatforms());
    }
  }, [status, dispatch]);

  if (status === 'loading') return <p>Loading platforms...</p>;
  if (status === 'failed') return <p>Failed to load platforms.</p>;

  return (
    <div className="card">
      <h2>Platforms</h2>
      <ul className="platform-list">
        {platforms.map((platform) => (
          <li key={platform.id}>
            <strong>{platform.name}</strong>
            <span className="muted"> — max {platform.maxChars} chars</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
