import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/auth.js';

export default function RestablecerContrasena() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setExito('');
    try {
      const res = await authApi.resetPassword(token, password);
      setExito(res.mensaje);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <h1>Restablecer contraseña</h1>
      {exito && (
        <>
          <p className="success">{exito}</p>
          <Link to="/iniciar-sesion">Inicia sesión</Link>
        </>
      )}
      {!exito && (
        <form onSubmit={handleSubmit}>
          {error && <p className="error">{error}</p>}
          <label>
            Contraseña nueva (mínimo 8 caracteres)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
          <button type="submit">Restablecer</button>
        </form>
      )}
    </div>
  );
}