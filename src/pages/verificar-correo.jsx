import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/auth.js';

export default function VerificarCorreo() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [estado, setEstado] = useState('cargando'); // cargando | ok | error
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!token) {
      setEstado('error');
      setMensaje('Falta el enlace de verificación.');
      return;
    }
    authApi
      .verifyEmail(token)
      .then((res) => {
        setEstado('ok');
        setMensaje(res.mensaje);
      })
      .catch((err) => {
        setEstado('error');
        setMensaje(err.message);
      });
  }, [token]);

  return (
    <div className="auth-page">
      <h1>Verificación de correo</h1>
      {estado === 'cargando' && <p>Verificando tu correo...</p>}
      {estado === 'ok' && (
        <>
          <p className="success">{mensaje}</p>
          <Link to="/iniciar-sesion">Inicia sesión</Link>
        </>
      )}
      {estado === 'error' && (
        <p className="error">{mensaje}</p>
      )}
    </div>
  );
}