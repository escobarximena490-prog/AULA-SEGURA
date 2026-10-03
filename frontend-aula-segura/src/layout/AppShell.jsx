import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const staffLinks = [
  { to: '/', label: 'Inicio', icon: HomeIcon },
  { to: '/registro', label: 'Registro', icon: CheckIcon },
  { to: '/estudiantes', label: 'Estudiantes', icon: UsersIcon },
  { to: '/reportes', label: 'Reportes', icon: ChartIcon },
  { to: '/documentacion', label: 'Docs', icon: DocsIcon },
  { to: '/administracion', label: 'Admin', icon: UsersIcon, admin: true },
];

const studentLinks = [
  { to: '/', label: 'Inicio', icon: HomeIcon },
  { to: '/mi-historial', label: 'Historial', icon: ChartIcon },
  { to: '/documentacion', label: 'Docs', icon: DocsIcon },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const links = user?.tipo === 'estudiante'
    ? studentLinks
    : staffLinks.filter((link) => !link.admin || user?.rol === 'Administrador');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      <aside className="hidden lg:flex w-64 flex-col bg-navy text-white">
        <div className="px-6 py-7 border-b border-white/10">
          <p className="font-mono text-[11px] tracking-[0.25em] text-gold uppercase">Institución</p>
          <h1 className="font-display text-3xl leading-none mt-1">Aula Segura</h1>
          <p className="text-white/70 text-sm mt-2">Control de llegadas tarde</p>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive ? 'bg-white/10 text-gold' : 'text-white/80 hover:bg-white/5'
                }`
              }
            >
              <link.icon />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-5 border-t border-white/10">
          <p className="text-sm font-medium">{user?.nombre}</p>
          <p className="text-xs text-white/60">{user?.rol}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 text-sm text-gold hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 pb-24 lg:pb-0">
        <header className="lg:hidden bg-navy text-white px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] text-gold uppercase">Aula Segura</p>
            <p className="font-display text-xl">Llegadas tarde</p>
          </div>
          <button type="button" onClick={logout} className="text-xs text-gold">Salir</button>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>

      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 bg-navy text-white grid border-t border-white/10"
        style={{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }}
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-3 text-[11px] ${
                isActive ? 'text-gold' : 'text-white/70'
              }`
            }
          >
            <link.icon />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12.5 2.3 2.3 4.7-5.3" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 19c.3-2.3 1.8-4 4.5-4.5" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19h16M7 16V9m5 7V5m5 11v-6" />
    </svg>
  );
}
function DocsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 3h8l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M15 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}
