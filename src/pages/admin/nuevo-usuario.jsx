import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../../services/users.js';

const ROLES = ['Usuario', 'Bibliotecólogo', 'Webmaster', 'Administrador'];

export default function NuevoUsuario() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    password: '',
    rol: 'Usuario'
  });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrores({});
    setEnviando(true);
    try {
      const res = await usersApi.create(form);
      alert(res.mensaje);
      navigate('/admin/usuarios');
    } catch (err) {
      setErrores({ general: err.message, campo: err.campo });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <h1>Nuevo usuario</h1>
      <p className="aviso">Deberá cambiar su contraseña en el primer inicio de sesión.</p>
      {errores.general && <p className="error">{errores.general}</p>}
      <form onSubmit={handleSubmit} className="formulario">
        <label>
          Nombre
          <input name="nombre" value={form.nombre} onChange={handleChange} required />
        </label>
        <label>
          Correo
          <input name="correo" type="email" value={form.correo} onChange={handleChange} required />
        </label>
        <label>
          Contraseña inicial
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
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
        <button type="submit" disabled={enviando}>
          {enviando ? 'Creando...' : 'Crear usuario'}
        </button>
      </form>
    </div>
  );
}