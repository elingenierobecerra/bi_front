import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../src/contexts/auth-context.jsx';
import IniciarSesion from '../src/pages/iniciar-sesion.jsx';
import CambiarContrasena from '../src/pages/cambiar-contrasena.jsx';
import { mockFetch, mockRespuesta, restablecerFetch } from './helpers.js';

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return null;
  return usuario ? children : <Navigate to="/iniciar-sesion" replace />;
}

describe('Caducidad de sesión (US5)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    restablecerFetch();
  });

  it('una sesión inválida al cargar /me limpia el contexto y redirige a inicio de sesión', async () => {
    mockFetch({
      'GET /api/auth/me': mockRespuesta({
        status: 401,
        body: { error: { codigo: 'NO_AUTENTICADO', mensaje: 'Tu sesión no es válida o caducó.' } }
      })
    });

    render(
      <MemoryRouter initialEntries={['/cambiar-contrasena']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/cambiar-contrasena"
              element={
                <RutaProtegida>
                  <CambiarContrasena />
                </RutaProtegida>
              }
            />
            <Route path="/iniciar-sesion" element={<IniciarSesion />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Sin sesión válida, la app muestra la página de inicio de sesión
    await waitFor(() =>
      expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
    );
  });
});