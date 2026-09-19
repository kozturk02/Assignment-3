const PORT = process.env.PORT || process.env.BACKEND_PORT || 3001;
const HOST = process.env.HOST_ADDRESS || 'localhost';
const FRONTEND_PORT = process.env.FRONTEND_PORT || 5173;
const FRONTEND_URL = `http://${HOST}:${FRONTEND_PORT}`;

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = res.status === 204 ? null : await res.json();

  if (!res.ok) {
    throw new Error(data?.error || 'Unknown error');
  }

  return data;
}

export function getCapsules() {
  return request('/api/capsules');
}

export function createCapsule(data) {
  return request('/api/capsules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateCapsule(id, data) {
  return request(`/api/capsules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteCapsule(id) {
  return request(`/api/capsules/${id}`, {
    method: 'DELETE',
  });
}

export function loginWithGitHub() {
  window.location.href = `${BASE_URL}/login`;
}

export function logout() {
  return request('/logout', {
    method: 'POST',
  });
}

export function getHealth() {
  return request('/api/health');
}

export function checkLogin() {
  return request('/api/auth/me');
}