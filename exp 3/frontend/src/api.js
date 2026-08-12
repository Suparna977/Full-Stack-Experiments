const BASE_URL = 'http://localhost:5000/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    throw error;
  }

  return data;
}

export const authApi = {
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
};

export const postsApi = {
  getAll: (token) => request('/posts', { token }),
  create: (token, post) => request('/posts', { method: 'POST', body: post, token }),
  update: (token, id, post) => request(`/posts/${id}`, { method: 'PUT', body: post, token }),
  remove: (token, id) => request(`/posts/${id}`, { method: 'DELETE', token }),
};
