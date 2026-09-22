import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../src/contexts/auth-context.jsx';
import NavBar from '../src/components/nav-bar.jsx';
import AccesoDenegado from '../src/pages/acceso-denegado.jsx';
import { mockFetch, mockRespuesta, restablecerFetch } from './helpers.js';

describe('RBAC del menú y acceso denegado (US4)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    restablecerFetch();
  });

  it('el menú de un no-administrador no muestra el módulo de usuarios', async () => {
    mockFetch({
      'GET /api/auth/me': mockRespuesta({
        status: 200,
        body: {
          usuario: {
            id: 'u1',
            email: 'ana@example.com',
            estado: 'activa',
            requiereCambioPassword: false,
            rol: { nombre: 'Usuario', permisos: [] }
          }
        }
      })
    });
    render(
      <MemoryRouter>
        <AuthProvider>
          <NavBar />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Cerrar sesión')).toBeInTheDocument());
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
  });

  it('el menú de un administrador sí muestra el módulo de usuarios', async () => {
    mockFetch({
      'GET /api/auth/me': mockRespuesta({
        status: 200,
        body: {
          usuario: {
            id: 'a1',
            email: 'admin@example.com',
            estado: 'activa',
            requiereCambioPassword: false,
            rol: { nombre: 'Administrador', permisos: ['usuarios.gestionar'] }
          }
        }
      })
    });
    render(
      <MemoryRouter>
        <AuthProvider>
          <NavBar />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Usuarios')).toBeInTheDocument());
  });

  it('la pantalla de acceso denegado se muestra al visitar /acceso-denegado', () => {
    render(
      <MemoryRouter initialEntries={['/acceso-denegado']}>
        <Routes>
          <Route path="/acceso-denegado" element={<AccesoDenegado />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
  });
});