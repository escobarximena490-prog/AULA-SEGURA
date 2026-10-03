import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext';
import AppShell from './layout/AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Registro from './pages/Registro';
import Estudiantes from './pages/Estudiantes';
import Reportes from './pages/Reportes';
import Documentacion from './pages/Documentacion';
import MiHistorial from './pages/MiHistorial';
import Usuarios from './pages/Usuarios';
import PWABadge from './PWABadge.jsx';

function Guard({ children, staff, admin, student }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen grid place-items-center text-navy">Cargando…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (staff && user.tipo !== 'usuario') return <Navigate to="/" replace />;
  if (admin && user.rol !== 'Administrador') return <Navigate to="/" replace />;
  if (student && user.tipo !== 'estudiante') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={!loading && user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/"
          element={(
            <Guard>
              <AppShell />
            </Guard>
          )}
        >
          <Route index element={<Dashboard />} />
          <Route path="registro" element={<Guard staff><Registro /></Guard>} />
          <Route path="estudiantes" element={<Guard staff><Estudiantes /></Guard>} />
          <Route path="reportes" element={<Guard staff><Reportes /></Guard>} />
          <Route path="administracion" element={<Guard admin><Usuarios /></Guard>} />
          <Route path="mi-historial" element={<Guard student><MiHistorial /></Guard>} />
          <Route path="documentacion" element={<Documentacion />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PWABadge />
    </>
  );
}
