// In-memory "posts" collection for the social media handle.
// Replace with a MongoDB collection (Mongoose model) for the full MERN version.

let posts = [
  {
    id: 1,
    title: 'Welcome to our page!',
    content: 'This is our very first post. Excited to share updates here.',
    author: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Behind the scenes',
    content: 'A sneak peek at what we are building this month.',
    author: 'editor',
    createdAt: new Date().toISOString(),
  },
];

let nextId = 3;

function getAllPosts() {
  return posts;
}

function getPostById(id) {
  return posts.find((p) => p.id === Number(id));
}

function createPost({ title, content, author }) {
  const newPost = {
    id: nextId++,
    title,
    content,
    author,
    createdAt: new Date().toISOString(),
  };
  posts.push(newPost);
  return newPost;
}

function updatePost(id, { title, content }) {
  const post = getPostById(id);
  if (!post) return null;
  if (title !== undefined) post.title = title;
  if (content !== undefined) post.content = content;
  post.updatedAt = new Date().toISOString();
  return post;
}

function deletePost(id) {
  const index = posts.findIndex((p) => p.id === Number(id));
  if (index === -1) return false;
  posts.splice(index, 1);
  return true;
}

module.exports = { getAllPosts, getPostById, createPost, updatePost, deletePost };
