// Simulates a posts "database" using localStorage, since there's no backend
// to hold state in memory. All CRUD functions here are the client-side
// stand-in for what would normally be Express route handlers hitting a
// real database.

const STORAGE_KEY = 'jwt_demo_posts';

const seedPosts = [
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

function loadPosts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedPosts));
    return [...seedPosts];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [...seedPosts];
  }
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function getAllPosts() {
  return loadPosts();
}

export function createPost({ title, content, author }) {
  const posts = loadPosts();
  const nextId = posts.length ? Math.max(...posts.map((p) => p.id)) + 1 : 1;
  const newPost = { id: nextId, title, content, author, createdAt: new Date().toISOString() };
  posts.push(newPost);
  savePosts(posts);
  return newPost;
}

export function updatePost(id, { title, content }) {
  const posts = loadPosts();
  const post = posts.find((p) => p.id === Number(id));
  if (!post) return null;
  if (title !== undefined) post.title = title;
  if (content !== undefined) post.content = content;
  post.updatedAt = new Date().toISOString();
  savePosts(posts);
  return post;
}

export function deletePost(id) {
  const posts = loadPosts();
  const filtered = posts.filter((p) => p.id !== Number(id));
  if (filtered.length === posts.length) return false;
  savePosts(filtered);
  return true;
}

export function resetPosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedPosts));
  return [...seedPosts];
}
