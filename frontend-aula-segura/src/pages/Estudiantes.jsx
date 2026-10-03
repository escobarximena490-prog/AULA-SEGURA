import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Estudiantes() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'Administrador';
  const [rows, setRows] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    documento: '',
    nombre: '',
    apellido: '',
    id_curso: '',
  });
  const [cuenta, setCuenta] = useState({ id: '', correo: '', contrasena: '' });

  async function load(term = q) {
    const [estudiantes, courseRows] = await Promise.all([
      api(`/estudiantes${term ? `?q=${encodeURIComponent(term)}` : ''}`),
      api('/cursos'),
    ]);
    setRows(estudiantes);
    setCursos(courseRows);
    if (!form.id_curso && courseRows[0]) {
      setForm((current) => ({ ...current, id_curso: courseRows[0].id_curso }));
    }
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function crear(event) {
    event.preventDefault();
    setError('');
    try {
      await api('/estudiantes', { method: 'POST', body: JSON.stringify(form) });
      setForm({ documento: '', nombre: '', apellido: '', id_curso: form.id_curso });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggle(row) {
    await api(`/estudiantes/${row.id_estudiante}`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: !row.estado }),
    });
    await load();
  }

  async function crearCuenta(event) {
    event.preventDefault();
    setError('');
    try {
      await api(`/estudiantes/${cuenta.id}/cuenta`, {
        method: 'POST',
        body: JSON.stringify({ correo: cuenta.correo, contrasena: cuenta.contrasena }),
      });
      setCuenta({ id: '', correo: '', contrasena: '' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2 className="font-display text-4xl">Estudiantes</h2>
      <p className="text-slate-500 mt-1">Búsqueda por nombre, documento o grado. Cada ficha muestra el total de tardanzas.</p>
      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}

      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          load(e.target.value).catch((err) => setError(err.message));
        }}
        placeholder="Buscar estudiante"
        className="mt-6 w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white"
      />

      <div className="mt-6 overflow-x-auto bg-white rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="text-left bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Estudiante</th>
              <th className="px-4 py-3">Documento</th>
              <th className="px-4 py-3">Curso</th>
              <th className="px-4 py-3">Tardanzas</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Cuenta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id_estudiante} className="border-t border-slate-100">
                <td className="px-4 py-3">{row.apellido}, {row.nombre}</td>
                <td className="px-4 py-3 font-mono">{row.documento}</td>
                <td className="px-4 py-3">{row.nombre_curso}</td>
                <td className="px-4 py-3 font-medium">{row.total_llegadas}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggle(row)}
                    className={`text-xs rounded-full px-2 py-1 ${row.estado ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {row.estado ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-4 py-3 text-xs">{row.correo || 'Sin cuenta'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={crear} className="mt-8 bg-white rounded-2xl border border-slate-200 p-5 grid sm:grid-cols-2 gap-3">
        <h3 className="sm:col-span-2 font-medium">Registrar estudiante</h3>
        <input required value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} placeholder="Documento" className="rounded-xl border px-3 py-2.5" />
        <select value={form.id_curso} onChange={(e) => setForm({ ...form, id_curso: e.target.value })} className="rounded-xl border px-3 py-2.5">
          {cursos.map((c) => <option key={c.id_curso} value={c.id_curso}>{c.nombre_curso}</option>)}
        </select>
        <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" className="rounded-xl border px-3 py-2.5" />
        <input required value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} placeholder="Apellido" className="rounded-xl border px-3 py-2.5" />
        <button className="sm:col-span-2 rounded-xl bg-navy text-white py-3">Guardar estudiante</button>
      </form>

      {isAdmin && (
        <form onSubmit={crearCuenta} className="mt-6 bg-navy text-white rounded-2xl p-5 grid sm:grid-cols-2 gap-3">
          <h3 className="sm:col-span-2 font-display text-2xl">Cuenta de estudiante</h3>
          <select value={cuenta.id} onChange={(e) => setCuenta({ ...cuenta, id: e.target.value })} className="rounded-xl bg-white text-slate-900 px-3 py-2.5 sm:col-span-2">
            <option value="">Seleccione estudiante</option>
            {rows.filter((r) => !r.correo).map((r) => (
              <option key={r.id_estudiante} value={r.id_estudiante}>{r.apellido} {r.nombre}</option>
            ))}
          </select>
          <input required type="email" value={cuenta.correo} onChange={(e) => setCuenta({ ...cuenta, correo: e.target.value })} placeholder="Correo" className="rounded-xl bg-white text-slate-900 px-3 py-2.5" />
          <input required type="password" value={cuenta.contrasena} onChange={(e) => setCuenta({ ...cuenta, contrasena: e.target.value })} placeholder="Contraseña" className="rounded-xl bg-white text-slate-900 px-3 py-2.5" />
          <button className="sm:col-span-2 rounded-xl bg-gold text-navy py-3 font-medium">Crear cuenta</button>
        </form>
      )}
    </div>
  );
}
