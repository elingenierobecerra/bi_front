import { Link } from 'react-router-dom';

export default function AccesoDenegado() {
  return (
    <div className="auth-page">
      <h1>Acceso denegado</h1>
      <p className="error">No tienes permiso para acceder a esta sección.</p>
      <Link to="/iniciar-sesion">Volver al inicio</Link>
    </div>
  );
}