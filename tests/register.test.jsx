import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Registro from '../src/pages/registro.jsx';
import VerificarCorreo from '../src/pages/verificar-correo.jsx';
import { mockFetch, mockRespuesta, restablecerFetch } from './helpers.js';

describe('Página de registro (US1)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    restablecerFetch();
  });

  it('envía el formulario y muestra el mensaje de éxito', async () => {
    mockFetch({
      'POST /api/auth/register': mockRespuesta({
        status: 201,
        body: { usuarioId: 'abc', mensaje: 'Cuenta creada.' }
      })
    });
    render(
      <MemoryRouter>
        <Registro />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana Pérez' } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'clave-secreta-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }));

    await waitFor(() =>
      expect(screen.getByText(/Cuenta creada/i)).toBeInTheDocument()
    );
  });

  it('muestra el error devuelto por el API', async () => {
    mockFetch({
      'POST /api/auth/register': mockRespuesta({
        status: 409,
        body: { error: { codigo: 'CORREO_EN_USO', mensaje: 'El correo ya está registrado.' } }
      })
    });
    render(
      <MemoryRouter>
        <Registro />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'clave-secreta-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }));

    await waitFor(() =>
      expect(screen.getByText(/El correo ya está registrado/i)).toBeInTheDocument()
    );
  });
});

describe('Página de verificación de correo (US1)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    restablecerFetch();
  });

  it('muestra éxito cuando el token es válido', async () => {
    mockFetch({
      'POST /api/auth/verify-email': mockRespuesta({
        status: 200,
        body: { mensaje: 'Correo verificado. Ya puedes iniciar sesión.' }
      })
    });
    render(
      <MemoryRouter initialEntries={['/verificar-correo?token=abc']}>
        <VerificarCorreo />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/Correo verificado/i)).toBeInTheDocument()
    );
  });

  it('muestra error si el token no es válido', async () => {
    mockFetch({
      'POST /api/auth/verify-email': mockRespuesta({
        status: 400,
        body: { error: { codigo: 'TOKEN_INVALIDO', mensaje: 'El enlace de verificación ya fue usado o expiró.' } }
      })
    });
    render(
      <MemoryRouter initialEntries={['/verificar-correo?token=malo']}>
        <VerificarCorreo />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/ya fue usado o expiró/i)).toBeInTheDocument()
    );
  });
});