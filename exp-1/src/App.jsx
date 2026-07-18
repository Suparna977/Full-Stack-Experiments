import { useState } from "react";
import "./App.css";

function App() {
  const [post, setPost] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [publishedPost, setPublishedPost] = useState(null);
  const platforms = {
    Twitter: 280,
    Instagram: 2200,
    LinkedIn: 3000,
  };
  function handlePlatformChange(platform) {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(
        selectedPlatforms.filter((item) => item !== platform)
      );
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  }
  function handlePublish() {
  if (post.trim() === "") {
    alert("Please write something before publishing!");
    return;
  }

  const currentDateTime = new Date().toLocaleString();

  setPublishedPost({
    text: post,
    platforms: selectedPlatforms,
    dateTime: currentDateTime,
  });

  alert("Post published successfully!");
}

  return (
    <div className="container">
      <h1>Social Media Post Composer</h1>

      <h3>Select Platforms</h3>

      <div className="platforms">
        {Object.keys(platforms).map((platform) => (
          <label key={platform}>
            <input
              type="checkbox"
              checked={selectedPlatforms.includes(platform)}
              onChange={() => handlePlatformChange(platform)}
            />
            {platform}
          </label>
        ))}
      </div>

      <h3>Write Your Post</h3>

      <textarea
        placeholder="What's on your mind?"
        value={post}
        onChange={(event) => setPost(event.target.value)}
      />

      <p className="character-count">
        Total Characters: {post.length}
      </p>
      <div className="post-preview">
  <h3>Post Preview</h3>

  <div className="preview-box">
    {post ? post : "Your post will appear here..."}
  </div>
</div>
      <div className="validation">
        {selectedPlatforms.map((platform) => {
          const limit = platforms[platform];
          const isValid = post.length <= limit;

          return (
            <div
              key={platform}
              className={isValid ? "valid" : "invalid"}
            >
              <strong>{platform}</strong>: {post.length}/{limit} characters
              {isValid ? " ✓ Valid" : " ✗ Character limit exceeded!"}
            </div>
          );
        })}
      </div>

      {selectedPlatforms.length === 0 && (
        <p className="warning">
          Please select at least one platform.
        </p>
      )}

      <button
        onClick={handlePublish}
        disabled={
          selectedPlatforms.length === 0 ||
          post.trim() === "" ||
          selectedPlatforms.some(
            (platform) => post.length > platforms[platform]
          )
        }
      >
        Publish Post
      </button>
      {publishedPost && (
  <div className="published-section">
    <h2>✓ Post Published Successfully!</h2>

    <div className="published-content">
      <p className="published-text">
        "{publishedPost.text}"
      </p>

      <p>
        <strong>Published on:</strong> {publishedPost.dateTime}
      </p>

      <p>
        <strong>Platforms:</strong>{" "}
        {publishedPost.platforms.join(", ")}
      </p>
    </div>
  </div>
)}
    </div>
  );
}

export default App;