async function request(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body?.error?.mensaje || 'Ocurrió un error.');
    err.codigo = body?.error?.codigo;
    err.campo = body?.error?.campo;
    err.status = res.status;
    throw err;
  }
  return body;
}

export const usersApi = {
  listRoles: () => request('/api/users/roles'),
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString();
    return request(`/api/users?${qs}`);
  },
  get: (id) => request(`/api/users/${id}`),
  create: (data) => request('/api/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deactivate: (id) => request(`/api/users/${id}/deactivate`, { method: 'POST' }),
  reactivate: (id) => request(`/api/users/${id}/reactivate`, { method: 'POST' }),
  changePassword: (data) =>
    request('/api/users/me/password', { method: 'PATCH', body: JSON.stringify(data) })
};