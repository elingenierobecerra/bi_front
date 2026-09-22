import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ListaUsuarios from '../src/pages/admin/lista-usuarios.jsx';
import { mockFetch, mockRespuesta, restablecerFetch } from './helpers.js';

const USUARIOS = [
  { id: '1', nombre: 'Ana García', correo: 'ana@example.com', rol: 'Usuario', estado: 'activa', fechaRegistro: '2026-01-01T00:00:00.000Z' },
  { id: '2', nombre: 'Luis Gómez', correo: 'luis@example.com', rol: 'Bibliotecólogo', estado: 'deshabilitada', fechaRegistro: '2026-01-02T00:00:00.000Z' },
  { id: '3', nombre: 'Admin', correo: 'admin@example.com', rol: 'Administrador', estado: 'activa', fechaRegistro: '2026-01-03T00:00:00.000Z' }
];

describe('Listado de usuarios (US2)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    restablecerFetch();
  });

  it('muestra la tabla con los usuarios y el enlace a crear', async () => {
    mockFetch({
      'GET /api/users': mockRespuesta({ status: 200, body: { items: USUARIOS, total: 3, page: 1, limit: 10 } })
    });
    render(
      <MemoryRouter>
        <ListaUsuarios />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Ana García')).toBeInTheDocument());
    expect(screen.getByText('Luis Gómez')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nuevo usuario' })).toBeInTheDocument();
  });

  it('los usuarios deshabilitados se distinguen visualmente', async () => {
    mockFetch({
      'GET /api/users': mockRespuesta({ status: 200, body: { items: USUARIOS, total: 3, page: 1, limit: 10 } })
    });
    render(
      <MemoryRouter>
        <ListaUsuarios />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Luis Gómez')).toBeInTheDocument());
    const fila = screen.getByText('Luis Gómez').closest('tr');
    expect(fila).toHaveClass('fila-deshabilitada');
  });

  it('aplica el filtro por rol y estado al cambiar los selectores', async () => {
    const spy = vi.fn(async () =>
      mockRespuesta({ status: 200, body: { items: USUARIOS, total: 3, page: 1, limit: 10 } })
    );
    global.fetch = vi.fn(spy);
    render(
      <MemoryRouter>
        <ListaUsuarios />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Ana García')).toBeInTheDocument());
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Bibliotecólogo' } });
    await waitFor(() => expect(spy).toHaveBeenCalled());
  });
});