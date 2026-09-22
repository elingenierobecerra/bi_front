import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/auth-context.jsx';
import NavBar from './components/nav-bar.jsx';
import Registro from './pages/registro.jsx';
import VerificarCorreo from './pages/verificar-correo.jsx';
import IniciarSesion from './pages/iniciar-sesion.jsx';
import RecuperarContrasena from './pages/recuperar-contrasena.jsx';
import RestablecerContrasena from './pages/restablecer-contrasena.jsx';
import CambiarContrasena from './pages/cambiar-contrasena.jsx';
import AccesoDenegado from './pages/acceso-denegado.jsx';
import ListaUsuarios from './pages/admin/lista-usuarios.jsx';
import NuevoUsuario from './pages/admin/nuevo-usuario.jsx';
import DetalleUsuario from './pages/admin/detalle-usuario.jsx';

function EstadoCarga() {
  const { cargando } = useAuth();
  if (!cargando) return null;
  return <p className="cargando">Cargando...</p>;
}

function RutaProtegida({ children }) {
  const { usuario, cargando, pendienteCambioPassword } = useAuth();
  if (cargando) return <EstadoCarga />;
  if (!usuario) return <Navigate to="/iniciar-sesion" replace />;
  if (pendienteCambioPassword) return <Navigate to="/cambiar-contrasena" replace />;
  return children;
}

function RutaAdmin({ children }) {
  const { usuario, cargando, esAdministrador, pendienteCambioPassword } = useAuth();
  if (cargando) return <EstadoCarga />;
  if (!usuario) return <Navigate to="/iniciar-sesion" replace />;
  if (pendienteCambioPassword) return <Navigate to="/cambiar-contrasena" replace />;
  if (!esAdministrador()) return <Navigate to="/acceso-denegado" replace />;
  return children;
}

function Inicio() {
  const { usuario, cargando } = useAuth();
  if (cargando) return null;
  if (usuario?.rol?.nombre === 'Administrador') return <Navigate to="/admin/usuarios" replace />;
  return (
    <div className="auth-page">
      <h1>Bienvenido a la Biblioteca</h1>
      <p>Regístrate o inicia sesión para consultar libros y solicitar préstamos.</p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <NavBar />
      <main className="contenido">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/verificar-correo" element={<VerificarCorreo />} />
          <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
          <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />
          <Route path="/iniciar-sesion" element={<IniciarSesion />} />
          <Route
            path="/cambiar-contrasena"
            element={
              <RutaProtegida>
                <CambiarContrasena />
              </RutaProtegida>
            }
          />
          <Route path="/admin/usuarios" element={<RutaAdmin><ListaUsuarios /></RutaAdmin>} />
          <Route path="/admin/usuarios/nuevo" element={<RutaAdmin><NuevoUsuario /></RutaAdmin>} />
          <Route path="/admin/usuarios/:id" element={<RutaAdmin><DetalleUsuario /></RutaAdmin>} />
          <Route path="/acceso-denegado" element={<AccesoDenegado />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}