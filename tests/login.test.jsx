import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../src/contexts/auth-context.jsx';
import IniciarSesion from '../src/pages/iniciar-sesion.jsx';
import { mockFetch, mockRespuesta, restablecerFetch } from './helpers.js';

function ContenedorInicio() {
  return <p>Página de inicio</p>;
}

function ContenedorAdmin() {
  return <p>Panel de administración</p>;
}

describe('Inicio de sesión y contexto (US2)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    restablecerFetch();
  });

  it('muestra el error de correo no verificado', async () => {
    mockFetch({
      'POST /api/auth/login': mockRespuesta({
        status: 401,
        body: { error: { codigo: 'CORREO_NO_VERIFICADO', mensaje: 'Debes verificar tu correo.' } }
      })
    });
    render(
      <MemoryRouter>
        <AuthProvider>
          <IniciarSesion />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'clave' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() =>
      expect(screen.getByText(/Debes verificar tu correo/i)).toBeInTheDocument()
    );
  });

  it('un administrador navega al panel tras iniciar sesión', async () => {
    mockFetch({
      'POST /api/auth/login': mockRespuesta({
        status: 200,
        body: {
          usuario: {
            id: '1',
            email: 'admin@example.com',
            estado: 'activa',
            requiereCambioPassword: false,
            rol: { nombre: 'Administrador', permisos: ['usuarios.gestionar'] }
          }
        }
      })
    });
    render(
      <MemoryRouter initialEntries={['/iniciar-sesion']}>
        <AuthProvider>
          <Routes>
            <Route path="/iniciar-sesion" element={<IniciarSesion />} />
            <Route path="/admin/usuarios" element={<ContenedorAdmin />} />
            <Route path="/" element={<ContenedorInicio />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'clave' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() =>
      expect(screen.getByText('Panel de administración')).toBeInTheDocument()
    );
  });
});