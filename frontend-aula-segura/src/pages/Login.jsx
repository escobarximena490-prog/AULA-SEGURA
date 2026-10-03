import { useState } from 'react';
import { useAuth } from '../AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [correo, setCorreo] = useState('admin@llegapp.com');
  const [contrasena, setContrasena] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(correo, contrasena);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy text-white grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12">
        <p className="font-mono text-xs tracking-[0.3em] text-gold uppercase">PWA institucional</p>
        <div>
          <h1 className="font-display text-6xl leading-none">Aula Segura</h1>
          <p className="mt-6 max-w-md text-white/75 text-lg">
            Registro puntual de llegadas tarde, historial por estudiante y reportes para el personal autorizado.
          </p>
        </div>
        <p className="text-white/50 text-sm">Diseño pensado para portería, coordinación y consulta estudiantil.</p>
      </div>
      <div className="flex items-center justify-center px-5 py-12">
        <form onSubmit={onSubmit} className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-8 shadow-2xl">
          <p className="font-mono text-[11px] tracking-[0.22em] text-gold-dark uppercase">Ingreso</p>
          <h2 className="font-display text-4xl mt-1">Bienvenido</h2>
          <p className="text-slate-500 mt-2 mb-6">Use su cuenta de personal o de estudiante.</p>
          {error && <p className="mb-4 rounded-xl bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</p>}
          <label className="block text-sm font-medium mb-1">Correo</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 mb-4 outline-none focus:ring-2 focus:ring-navy/30"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <label className="block text-sm font-medium mb-1">Contraseña</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 mb-6 outline-none focus:ring-2 focus:ring-navy/30"
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-navy text-white py-3 font-medium hover:bg-navy-light disabled:opacity-60"
          >
            {loading ? 'Validando…' : 'Entrar'}
          </button>
          <div className="mt-6 text-xs text-slate-500 space-y-1">
            <p>Admin: admin@llegapp.com / Admin123!</p>
            <p>Encargado: porteria@llegapp.com / Encargado123!</p>
            <p>Estudiante: juan@llegapp.com / Estudiante123!</p>
          </div>
        </form>
      </div>
    </div>
  );
}
