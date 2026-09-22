import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DetalleUsuario from '../src/pages/admin/detalle-usuario.jsx';
import { mockFetch, mockRespuesta, restablecerFetch } from './helpers.js';

const DETALLE = {
  id: 'abc',
  nombre: 'Luis Gómez',
  correo: 'luis@example.com',
  rol: 'Usuario',
  estado: 'activa',
  fechaRegistro: '2026-01-02T00:00:00.000Z',
  requireCambioPassword: true
};

describe('Detalle de usuario (US3)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    restablecerFetch();
  });

  it('carga y muestra el detalle del usuario', async () => {
    mockFetch({
      'GET /api/users/abc': mockRespuesta({ status: 200, body: DETALLE })
    });
    render(
      <MemoryRouter initialEntries={['/admin/usuarios/abc']}>
        <Routes>
          <Route path="/admin/usuarios/:id" element={<DetalleUsuario />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Luis Gómez')).toBeInTheDocument());
    expect(screen.getByLabelText('Nombre')).toHaveValue('Luis Gómez');
    expect(screen.getByLabelText('Correo')).toHaveValue('luis@example.com');
    expect(screen.getByLabelText('Rol')).toHaveValue('Usuario');
    expect(screen.getByText(/Sí/)).toBeInTheDocument(); // requiere cambio de contraseña
  });

  it('guarda los cambios editando nombre, correo y rol', async () => {
    mockFetch({
      'GET /api/users/abc': mockRespuesta({ status: 200, body: DETALLE }),
      'PATCH /api/users/abc': mockRespuesta({ status: 200, body: { id: 'abc', mensaje: 'Usuario actualizado.' } })
    });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(
      <MemoryRouter initialEntries={['/admin/usuarios/abc']}>
        <Routes>
          <Route path="/admin/usuarios/:id" element={<DetalleUsuario />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByLabelText('Nombre')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Luis Gómez R.' } });
    fireEvent.change(screen.getByLabelText('Rol'), { target: { value: 'Bibliotecólogo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    expect(alertSpy).toHaveBeenCalledWith('Usuario actualizado.');
  });

  it('muestra el error de conflicto al perder el último administrador', async () => {
    mockFetch({
      'GET /api/users/abc': mockRespuesta({
        status: 200,
        body: { ...DETALLE, nombre: 'Solo Admin', rol: 'Administrador' }
      }),
      'PATCH /api/users/abc': mockRespuesta({
        status: 409,
        body: { error: { codigo: 'SIN_ADMINISTRADOR', mensaje: 'No se puede dejar el sistema sin un administrador activo.' } }
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

    await waitFor(() => expect(screen.getByLabelText('Rol')).toHaveValue('Administrador'));
    fireEvent.change(screen.getByLabelText('Rol'), { target: { value: 'Usuario' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(screen.getByText(/No se puede dejar el sistema/i)).toBeInTheDocument()
    );
  });
});