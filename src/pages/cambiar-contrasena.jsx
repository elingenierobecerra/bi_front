import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../services/users.js';
import { useAuth } from '../contexts/auth-context.jsx';

export default function CambiarContrasena() {
  const { cargarUsuario, esAdministrador } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ passwordActual: '', passwordNueva: '' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setExito('');
    try {
      await usersApi.changePassword(form);
      await cargarUsuario();
      setExito('Contraseña actualizada.');
      navigate(esAdministrador() ? '/admin/usuarios' : '/iniciar-sesion');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <h1>Cambiar contraseña</h1>
      <p>Debes cambiar la contraseña inicial antes de continuar.</p>
      {exito && <p className="success">{exito}</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Contraseña actual
          <input
            name="passwordActual"
            type="password"
            value={form.passwordActual}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Nueva contraseña (mínimo 8 caracteres)
          <input
            name="passwordNueva"
            type="password"
            value={form.passwordNueva}
            onChange={handleChange}
            required
            minLength={8}
          />
        </label>
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}