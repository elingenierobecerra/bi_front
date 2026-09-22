import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DetalleUsuario from '../src/pages/admin/detalle-usuario.jsx';
import { mockFetch, mockRespuesta, restablecerFetch } from './helpers.js';

const DETALLE = {
  id: 'abc',
  nombre: 'Ana García',
  correo: 'ana@example.com',
  rol: 'Usuario',
  estado: 'activa',
  fechaRegistro: '2026-01-01T00:00:00.000Z'
};

describe('Estado de usuario (US4)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    restablecerFetch();
  });

  it('deshabilita al confirmar y actualiza el estado en pantalla', async () => {
    mockFetch({
      'GET /api/users/abc': mockRespuesta({ status: 200, body: DETALLE }),
      'POST /api/users/abc/deactivate': mockRespuesta({ status: 200, body: { id: 'abc', estado: 'deshabilitada' } })
    });
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    render(
      <MemoryRouter initialEntries={['/admin/usuarios/abc']}>
        <Routes>
          <Route path="/admin/usuarios/:id" element={<DetalleUsuario />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Deshabilitar' })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Deshabilitar' }));

    await waitFor(() =>
      expect(screen.getByText('deshabilitada')).toBeInTheDocument()
    );
  });

  it('reactiva a un usuario deshabilitado', async () => {
    mockFetch({
      'GET /api/users/abc': mockRespuesta({ status: 200, body: { ...DETALLE, estado: 'deshabilitada' } }),
      'POST /api/users/abc/reactivate': mockRespuesta({ status: 200, body: { id: 'abc', estado: 'activa' } })
    });
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    render(
      <MemoryRouter initialEntries={['/admin/usuarios/abc']}>
        <Routes>
          <Route path="/admin/usuarios/:id" element={<DetalleUsuario />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Reactivar' })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reactivar' }));

    await waitFor(() => expect(screen.getByText('activa')).toBeInTheDocument());
  });

  it('muestra el error de conflicto del backend', async () => {
    mockFetch({
      'GET /api/users/abc': mockRespuesta({ status: 200, body: DETALLE }),
      'POST /api/users/abc/deactivate': mockRespuesta({
        status: 409,
        body: { error: { codigo: 'SIN_ADMINISTRADOR', mensaje: 'No se puede deshabilitar al último administrador activo.' } }
      })
    });
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    render(
      <MemoryRouter initialEntries={['/admin/usuarios/abc']}>
        <Routes>
          <Route path="/admin/usuarios/:id" element={<DetalleUsuario />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Deshabilitar' })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Deshabilitar' }));

    await waitFor(() =>
      expect(screen.getByText(/No se puede deshabilitar/i)).toBeInTheDocument()
    );
  });
});