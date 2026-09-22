import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../src/contexts/auth-context.jsx';
import NavBar from '../src/components/nav-bar.jsx';
import AccesoDenegado from '../src/pages/acceso-denegado.jsx';
import ListaUsuarios from '../src/pages/admin/lista-usuarios.jsx';
import { mockFetch, mockRespuesta, restablecerFetch } from './helpers.js';

function RutaAdmin({ children }) {
  const { usuario, cargando, esAdministrador } = useAuth();
  if (cargando) return null;
  if (!usuario) return <Navigate to="/iniciar-sesion" replace />;
  if (!esAdministrador()) return <Navigate to="/acceso-denegado" replace />;
  return children;
}

describe('Navegación y protección de rutas admin (US5)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    restablecerFetch();
  });

  it('un rol sin permiso no ve el módulo de administración', async () => {
    mockFetch({
      'GET /api/auth/me': mockRespuesta({
        status: 200,
        body: {
          usuario: {
            id: 'u1',
            email: 'luis@example.com',
            estado: 'activa',
            requiereCambioPassword: false,
            rol: { nombre: 'Bibliotecólogo', permisos: ['prestamos.registrar'] }
          }
        }
      })
    });
    render(
      <MemoryRouter>
        <AuthProvider>
          <NavBar />
          <Routes>
            <Route path="/iniciar-sesion" element={<p>Inicio sesión</p>} />
            <Route path="/admin/usuarios" element={<RutaAdmin><ListaUsuarios /></RutaAdmin>} />
            <Route path="/acceso-denegado" element={<AccesoDenegado />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Cerrar sesión')).toBeInTheDocument());
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
  });

  it('forzar la ruta admin sin permiso muestra la pantalla de acceso denegado', async () => {
    mockFetch({
      'GET /api/auth/me': mockRespuesta({
        status: 200,
        body: {
          usuario: {
            id: 'u1',
            email: 'luis@example.com',
            estado: 'activa',
            requiereCambioPassword: false,
            rol: { nombre: 'Bibliotecólogo', permisos: ['prestamos.registrar'] }
          }
        }
      })
    });
    render(
      <MemoryRouter initialEntries={['/admin/usuarios']}>
        <AuthProvider>
          <Routes>
            <Route path="/iniciar-sesion" element={<p>Inicio sesión</p>} />
            <Route path="/admin/usuarios" element={<RutaAdmin><ListaUsuarios /></RutaAdmin>} />
            <Route path="/acceso-denegado" element={<AccesoDenegado />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText('Acceso denegado')).toBeInTheDocument()
    );
  });
});