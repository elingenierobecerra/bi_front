import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context.jsx';

export default function NavBar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const esAdmin = usuario?.rol?.nombre === 'Administrador';

  async function salir() {
    await cerrarSesion();
    navigate('/iniciar-sesion');
  }

  return (
    <nav className="nav-bar">
      <span className="nav-brand">Biblioteca</span>
      <div className="nav-links">
        {usuario && (
          <>
            <span className="nav-rol">
              {usuario.rol?.nombre ??
                (usuario.pendienteCambioPassword ? 'Cambio de contraseña' : '')}
            </span>
            {esAdmin && <Link to="/admin/usuarios">Usuarios</Link>}
            {!esAdmin && <Link to="/">Inicio</Link>}
            <button type="button" onClick={salir} className="btn-link">
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </nav>
  );
}