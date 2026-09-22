import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RecuperarContrasena from '../src/pages/recuperar-contrasena.jsx';
import RestablecerContrasena from '../src/pages/restablecer-contrasena.jsx';
import { mockFetch, mockRespuesta, restablecerFetch } from './helpers.js';

describe('Recuperación de contraseña (US3)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    restablecerFetch();
  });

  it('muestra el mensaje genérico al solicitar recuperación', async () => {
    mockFetch({
      'POST /api/auth/forgot-password': mockRespuesta({
        status: 200,
        body: { mensaje: 'Si el correo está registrado, recibirás un enlace.' }
      })
    });
    render(
      <MemoryRouter>
        <RecuperarContrasena />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    await waitFor(() =>
      expect(screen.getByText(/Si el correo está registrado/i)).toBeInTheDocument()
    );
  });

  it('la página de restablecer muestra el mensaje de éxito con contraseña nueva', async () => {
    mockFetch({
      'POST /api/auth/reset-password': mockRespuesta({
        status: 200,
        body: { mensaje: 'Contraseña restablecida. Ya puedes iniciar sesión.' }
      })
    });
    render(
      <MemoryRouter initialEntries={['/restablecer-contrasena?token=abc']}>
        <RestablecerContrasena />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Contraseña nueva/i), { target: { value: 'clave-nueva-456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));

    await waitFor(() =>
      expect(screen.getByText(/Contraseña restablecida/i)).toBeInTheDocument()
    );
  });

  it('la página de restablecer muestra el requisito mínimo', () => {
    render(
      <MemoryRouter initialEntries={['/restablecer-contrasena?token=abc']}>
        <RestablecerContrasena />
      </MemoryRouter>
    );
    expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument();
  });
});