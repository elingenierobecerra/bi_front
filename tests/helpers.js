import { vi } from 'vitest';

export function mockRespuesta({ status = 200, ok, body }) {
  const isOk = ok ?? (status >= 200 && status < 300);
  return {
    ok: isOk,
    status,
    json: async () => body
  };
}

export function mockFetch(mocks) {
  global.fetch = vi.fn(async (url, options) => {
    const path = String(url).split('?')[0];
    const key = `${options?.method || 'GET'} ${path}`;
    const m = mocks[key] ?? mocks[path];
    if (!m) {
      return mockRespuesta({ status: 500, body: { error: { codigo: 'SIN_MOCK', mensaje: `Sin mock para ${key}` } } });
    }
    if (typeof m === 'function') return m();
    if (typeof m.json === 'function') return m;
    return mockRespuesta(m);
  });
}

export function restablecerFetch() {
  global.fetch = undefined;
}