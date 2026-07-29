// mockApi.js
// Simulates a backend with network latency using setTimeout + Promise.
// In a real app these functions would be replaced with fetch()/axios calls.

let platformsDB = [
  { id: 'p1', name: 'Twitter/X', maxChars: 280 },
  { id: 'p2', name: 'LinkedIn', maxChars: 3000 },
  { id: 'p3', name: 'Instagram', maxChars: 2200 },
];

let postsDB = [
  {
    id: 'post1',
    title: 'Launch Day',
    content: 'Excited to launch our new product today!',
    platformId: 'p1',
    status: 'published',
    createdAt: '2026-07-20T09:00:00.000Z',
  },
  {
    id: 'post2',
    title: 'Behind the Scenes',
    content: 'Here is a look at how we built our latest feature.',
    platformId: 'p2',
    status: 'draft',
    createdAt: '2026-07-22T11:30:00.000Z',
  },
];

let nextPostId = 3;

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchPlatforms() {
  await delay(400);
  return [...platformsDB];
}

export async function fetchPosts() {
  await delay(600);
  return [...postsDB];
}

export async function createPost(newPost) {
  await delay(500);
  const post = {
    id: `post${nextPostId++}`,
    createdAt: new Date().toISOString(),
    status: 'draft',
    ...newPost,
  };
  postsDB.push(post);
  return post;
}

export async function updatePost(id, changes) {
  await delay(400);
  const index = postsDB.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('Post not found');
  postsDB[index] = { ...postsDB[index], ...changes };
  return postsDB[index];
}

export async function deletePost(id) {
  await delay(300);
  postsDB = postsDB.filter((p) => p.id !== id);
  return id;
}
