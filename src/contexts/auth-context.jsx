import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../services/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [sesionCaducada, setSesionCaducada] = useState(false);
  const [pendienteCambioPassword, setPendienteCambioPassword] = useState(false);

  const cargarUsuario = useCallback(async () => {
    try {
      const { usuario: u } = await authApi.me();
      setUsuario(u);
      setPendienteCambioPassword(false);
      setSesionCaducada(false);
    } catch (err) {
      if (err.codigo === 'ACCESO_DENEGADO') {
        // Cambio de contraseña pendiente (FR-017): mantener sesión, marcar requerido
        setUsuario({ pendienteCambioPassword: true });
        setPendienteCambioPassword(true);
      } else {
        setUsuario(null);
        setPendienteCambioPassword(false);
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuario();
  }, [cargarUsuario]);

  async function iniciarSesion(credenciales) {
    const { usuario: u } = await authApi.login(credenciales);
    setUsuario(u);
    return u;
  }

  async function cerrarSesion() {
    try {
      await authApi.logout();
    } finally {
      setUsuario(null);
    }
  }

  function actualizarUsuario(parcial) {
    setUsuario((prev) => ({ ...prev, ...parcial }));
  }

  function esRol(nombre) {
    return usuario?.rol?.nombre === nombre;
  }

  function esAdministrador() {
    return esRol('Administrador');
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        sesionCaducada,
        pendienteCambioPassword,
        cargarUsuario,
        iniciarSesion,
        cerrarSesion,
        actualizarUsuario,
        esRol,
        esAdministrador
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}