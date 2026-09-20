const BASE_URL = import.meta.env.DEV
  ? `http://${import.meta.env.VITE_BACKEND_HOST || window.location.hostname}:${import.meta.env.VITE_BACKEND_PORT || 3001}`
  : '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  let data = null;

  if (res.status !== 204) {
    const contentType = res.headers.get('content-type') || '';
    data = contentType.includes('application/json')
      ? await res.json()
      : { error: await res.text() };
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export function getCapsules() {
  return request('/api/capsules');
}

export function createCapsule(data) {
  return request('/api/capsules', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function updateCapsule(id, data) {
  return request(`/api/capsules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export function deleteCapsule(id) {
  return request(`/api/capsules/${id}`, {
    method: 'DELETE'
  });
}

export function loginWithGitHub() {
  window.location.href = `${BASE_URL}/login`;
}

export function logout() {
  return request('/logout', {
    method: 'POST'
  });
}

export function getHealth() {
  return request('/api/health');
}

export function checkLogin() {
  return request('/api/auth/me');
}