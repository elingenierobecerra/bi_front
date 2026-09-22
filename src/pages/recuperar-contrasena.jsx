import { useState } from 'react';
import { authApi } from '../services/auth.js';

export default function RecuperarContrasena() {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMensaje('');
    setEnviando(true);
    try {
      const res = await authApi.forgotPassword(email);
      setMensaje(res.mensaje);
    } catch (err) {
      setMensaje(err.codigo === 'VALIDACION' ? 'Ingresa un correo válido.' : err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Recuperar contraseña</h1>
      {mensaje && <p className="success">{mensaje}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Correo
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>
    </div>
  );
}