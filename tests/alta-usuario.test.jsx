import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NuevoUsuario from '../src/pages/admin/nuevo-usuario.jsx';
import { mockFetch, mockRespuesta, restablecerFetch } from './helpers.js';

describe('Alta de usuario (US1)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    restablecerFetch();
  });

  it('el rol por defecto es Usuario y se muestra el aviso de cambio de contraseña', () => {
    render(
      <MemoryRouter>
        <NuevoUsuario />
      </MemoryRouter>
    );
    expect(screen.getByLabelText('Rol')).toHaveValue('Usuario');
    expect(screen.getByText(/cambiar su contraseña/i)).toBeInTheDocument();
  });

  it('crea el usuario y navega de vuelta al listado', async () => {
    mockFetch({
      'POST /api/users': mockRespuesta({
        status: 201,
        body: { id: 'nuevo', mensaje: 'Usuario creado.' }
      })
    });
    render(
      <MemoryRouter initialEntries={['/admin/usuarios/nuevo']}>
        <Routes>
          <Route path="/admin/usuarios" element={<p>Listado de usuarios</p>} />
          <Route path="/admin/usuarios/nuevo" element={<NuevoUsuario />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña inicial'), { target: { value: 'clave-secreta-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }));

    await waitFor(() =>
      expect(screen.getByText('Listado de usuarios')).toBeInTheDocument()
    );
  });

  it('muestra errores del API en la página', async () => {
    mockFetch({
      'POST /api/users': mockRespuesta({
        status: 409,
        body: { error: { codigo: 'CORREO_EN_USO', mensaje: 'El correo ya está registrado.' } }
      })
    });
    render(
      <MemoryRouter>
        <NuevoUsuario />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña inicial'), { target: { value: 'clave-secreta-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }));

    await waitFor(() =>
      expect(screen.getByText(/El correo ya está registrado/i)).toBeInTheDocument()
    );
  });
});