import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context.jsx';

export default function IniciarSesion() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const u = await iniciarSesion(form);
      if (u.requiereCambioPassword) {
        navigate('/cambiar-contrasena');
        return;
      }
      if (u.rol?.nombre === 'Administrador') {
        navigate('/admin/usuarios');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.codigo === 'CORREO_NO_VERIFICADO') {
        setError('Debes verificar tu correo antes de iniciar sesión.');
      } else if (err.codigo === 'CUENTA_BLOQUEADA') {
        setError('Cuenta bloqueada temporalmente por intentos fallidos.');
      } else if (err.codigo === 'CUENTA_DESHABILITADA') {
        setError('Esta cuenta está deshabilitada.');
      } else {
        setError(err.message);
      }
    }
  }

  return (
    <div className="auth-page">
      <h1>Iniciar sesión</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Correo
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Contraseña
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>
        <button type="submit">Entrar</button>
      </form>
      <p>
        <Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
      </p>
    </div>
  );
}