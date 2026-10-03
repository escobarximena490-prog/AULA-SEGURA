import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Usuarios() {
  const [rows, setRows] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [error, setError] = useState('');
  const [userForm, setUserForm] = useState({
    nombre: '',
    rol: 'Encargado',
    correo: '',
    contrasena: '',
  });
  const [cursoForm, setCursoForm] = useState({ nombre_curso: '', grado: '', grupo: '' });

  async function load() {
    const [users, courses] = await Promise.all([api('/usuarios'), api('/cursos')]);
    setRows(users);
    setCursos(courses);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function crearUsuario(event) {
    event.preventDefault();
    setError('');
    try {
      await api('/usuarios', { method: 'POST', body: JSON.stringify(userForm) });
      setUserForm({ nombre: '', rol: 'Encargado', correo: '', contrasena: '' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function crearCurso(event) {
    event.preventDefault();
    setError('');
    try {
      await api('/cursos', { method: 'POST', body: JSON.stringify(cursoForm) });
      setCursoForm({ nombre_curso: '', grado: '', grupo: '' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2 className="font-display text-4xl">Administración</h2>
      <p className="text-slate-500 mt-1">Cuentas de personal y cursos.</p>
      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="mt-6 overflow-x-auto bg-white rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="text-left bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Correo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id_usuario} className="border-t">
                <td className="px-4 py-3">{row.nombre}</td>
                <td className="px-4 py-3">{row.rol}</td>
                <td className="px-4 py-3">{row.correo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={crearUsuario} className="mt-6 bg-white rounded-2xl border p-5 grid sm:grid-cols-2 gap-3">
        <h3 className="sm:col-span-2 font-medium">Nueva cuenta de usuario</h3>
        <input required value={userForm.nombre} onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })} placeholder="Nombre" className="rounded-xl border px-3 py-2.5" />
        <select value={userForm.rol} onChange={(e) => setUserForm({ ...userForm, rol: e.target.value })} className="rounded-xl border px-3 py-2.5">
          <option>Administrador</option>
          <option>Encargado</option>
        </select>
        <input required type="email" value={userForm.correo} onChange={(e) => setUserForm({ ...userForm, correo: e.target.value })} placeholder="Correo" className="rounded-xl border px-3 py-2.5" />
        <input required type="password" value={userForm.contrasena} onChange={(e) => setUserForm({ ...userForm, contrasena: e.target.value })} placeholder="Contraseña" className="rounded-xl border px-3 py-2.5" />
        <button className="sm:col-span-2 rounded-xl bg-navy text-white py-3">Crear usuario</button>
      </form>

      <form onSubmit={crearCurso} className="mt-6 bg-white rounded-2xl border p-5 grid sm:grid-cols-3 gap-3">
        <h3 className="sm:col-span-3 font-medium">Nuevo curso</h3>
        <input required value={cursoForm.nombre_curso} onChange={(e) => setCursoForm({ ...cursoForm, nombre_curso: e.target.value })} placeholder="Nombre (11A)" className="rounded-xl border px-3 py-2.5" />
        <input required type="number" value={cursoForm.grado} onChange={(e) => setCursoForm({ ...cursoForm, grado: e.target.value })} placeholder="Grado" className="rounded-xl border px-3 py-2.5" />
        <input required value={cursoForm.grupo} onChange={(e) => setCursoForm({ ...cursoForm, grupo: e.target.value })} placeholder="Grupo" className="rounded-xl border px-3 py-2.5" />
        <button className="sm:col-span-3 rounded-xl bg-navy text-white py-3">Crear curso</button>
      </form>

      <ul className="mt-4 text-sm text-slate-600 grid sm:grid-cols-3 gap-2">
        {cursos.map((c) => (
          <li key={c.id_curso} className="rounded-xl bg-white border px-3 py-2">{c.nombre_curso} · {c.total_estudiantes} estudiantes</li>
        ))}
      </ul>
    </div>
  );
}
