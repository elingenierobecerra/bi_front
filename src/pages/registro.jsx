import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/auth.js';

export default function Registro() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [errores, setErrores] = useState({});
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrores({});
    setExito('');
    setEnviando(true);
    try {
      await authApi.register(form);
      setExito('Cuenta creada. Revisa tu correo para verificar tu cuenta.');
    } catch (err) {
      setErrores({ general: err.message, campo: err.campo });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Crear cuenta</h1>
      {exito && <p className="success">{exito}</p>}
      {errores.general && <p className="error">{errores.general}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Nombre
          <input name="nombre" value={form.nombre} onChange={handleChange} required />
        </label>
        <label>
          Correo
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Contraseña
          <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} />
        </label>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Creando...' : 'Registrarme'}
        </button>
      </form>
      <p>
        ¿Ya tienes cuenta? <Link to="/iniciar-sesion">Inicia sesión</Link>
      </p>
    </div>
  );
}