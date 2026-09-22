import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usersApi } from '../../services/users.js';

const ROLES = ['Usuario', 'Bibliotecólogo', 'Webmaster', 'Administrador'];

export default function DetalleUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', rol: '' });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    usersApi
      .get(id)
      .then((u) => {
        setUsuario(u);
        setForm({ nombre: u.nombre, correo: u.correo, password: '', rol: u.rol });
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function guardar(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    const esDegradacion =
      usuario.rol === 'Administrador' && form.rol !== 'Administrador';
    if (esDegradacion && !window.confirm('Degradarás a este administrador. ¿Continuar?')) {
      setGuardando(false);
      return;
    }
    try {
      await usersApi.update(id, {
        nombre: form.nombre,
        correo: form.correo,
        ...(form.password ? { password: form.password } : {}),
        rol: form.rol
      });
      alert('Usuario actualizado.');
      setUsuario((prev) => ({ ...prev, ...form }));
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(accion) {
    if (!window.confirm(`¿Confirmas ${accion === 'deactivate' ? 'deshabilitar' : 'reactivar'} este usuario?`)) return;
    setError('');
    try {
      if (accion === 'deactivate') {
        const res = await usersApi.deactivate(id);
        setUsuario((prev) => ({ ...prev, estado: res.estado }));
      } else {
        const res = await usersApi.reactivate(id);
        setUsuario((prev) => ({ ...prev, estado: res.estado }));
      }
    } catch (err) {
      setError(err.message);
    }
  }

  if (cargando) return <p>Cargando usuario...</p>;
  if (!usuario) return <p className="error">{error}</p>;

  return (
    <div>
      <div className="page-header">
        <h1>{usuario.nombre}</h1>
        <button type="button" className="btn" onClick={() => navigate('/admin/usuarios')}>
          Volver
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="detalle">
        <p>
          <strong>Estado:</strong> {usuario.estado}{' '}
          {usuario.estado === 'deshabilitada' && <span className="etiqueta-deshabilitada">Deshabilitado</span>}
        </p>
        <p>
          <strong>Requiere cambio de contraseña:</strong>{' '}
          {usuario.requireCambioPassword ? 'Sí' : 'No'}
        </p>
        <p>
          <strong>Registro:</strong> {new Date(usuario.fechaRegistro).toLocaleString('es-ES')}
        </p>
        {usuario.fechaDesactivacion && (
          <p>
            <strong>Desactivado:</strong> {new Date(usuario.fechaDesactivacion).toLocaleString('es-ES')}
          </p>
        )}
        {usuario.fechaUltimaAccion && (
          <p>
            <strong>Última acción:</strong> {new Date(usuario.fechaUltimaAccion).toLocaleString('es-ES')}
          </p>
        )}
      </div>

      <form onSubmit={guardar} className="formulario">
        <label>
          Nombre
          <input name="nombre" value={form.nombre} onChange={handleChange} required />
        </label>
        <label>
          Correo
          <input name="correo" type="email" value={form.correo} onChange={handleChange} required />
        </label>
        <label>
          Nueva contraseña (opcional)
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
          />
        </label>
        <label>
          Rol
          <select name="rol" value={form.rol} onChange={handleChange}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <div className="acciones-estado">
        {usuario.estado === 'activa' ? (
          <button type="button" className="btn-danger" onClick={() => cambiarEstado('deactivate')}>
            Deshabilitar
          </button>
        ) : (
          <button type="button" className="btn" onClick={() => cambiarEstado('reactivate')}>
            Reactivar
          </button>
        )}
      </div>
    </div>
  );
}