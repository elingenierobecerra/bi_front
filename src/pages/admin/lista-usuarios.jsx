import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../../services/users.js';

const ESTADOS = ['', 'activa', 'deshabilitada'];
const ROLES = ['', 'Usuario', 'Bibliotecólogo', 'Webmaster', 'Administrador'];

export default function ListaUsuarios() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [filtros, setFiltros] = useState({ busqueda: '', rol: '', estado: '' });
  const [page, setPage] = useState(1);
  const limit = 10;
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError('');
    usersApi
      .list({
        nombre: filtros.busqueda || undefined,
        rol: filtros.rol || undefined,
        estado: filtros.estado || undefined,
        page,
        limit
      })
      .then((data) => {
        if (!activo) return;
        setItems(data.items);
        setTotal(data.total);
      })
      .catch((err) => activo && setError(err.message))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [filtros, page]);

  function handleFiltro(e) {
    setPage(1);
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  }

  return (
    <div>
      <div className="page-header">
        <h1>Usuarios</h1>
        <Link className="btn" to="/admin/usuarios/nuevo">
          Nuevo usuario
        </Link>
      </div>

      <div className="filtros">
        <input
          name="busqueda"
          placeholder="Buscar por nombre o correo"
          value={filtros.busqueda}
          onChange={handleFiltro}
        />
        <select name="rol" value={filtros.rol} onChange={handleFiltro}>
          {ROLES.map((r) => (
            <option key={r || 'todos'} value={r}>
              {r ? `Rol: ${r}` : 'Todos los roles'}
            </option>
          ))}
        </select>
        <select name="estado" value={filtros.estado} onChange={handleFiltro}>
          {ESTADOS.map((e) => (
            <option key={e || 'todos'} value={e}>
              {e ? `Estado: ${e}` : 'Todos los estados'}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      {cargando ? (
        <p>Cargando usuarios...</p>
      ) : items.length === 0 ? (
        <p>No hay usuarios que coincidan con la búsqueda.</p>
      ) : (
        <>
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className={u.estado === 'deshabilitada' ? 'fila-deshabilitada' : ''}>
                  <td>{u.nombre}</td>
                  <td>{u.correo}</td>
                  <td>{u.rol}</td>
                  <td>{u.estado}</td>
                  <td>{new Date(u.fechaRegistro).toLocaleDateString('es-ES')}</td>
                  <td>
                    <Link to={`/admin/usuarios/${u.id}`}>Ver detalle</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="paginacion">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </button>
            <span>
              Página {page} de {Math.max(1, Math.ceil(total / limit))} ({total} usuarios)
            </span>
            <button disabled={page * limit >= total} onClick={() => setPage((p) => p + 1)}>
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}