import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

const MOTIVOS = ['Transporte', 'Salud', 'Familiar', 'Clima', 'Otro'];

export default function Registro() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [curso, setCurso] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState('');
  const [motivo, setMotivo] = useState('Transporte');
  const [observacion, setObservacion] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api('/estudiantes'), api('/cursos')])
      .then(([e, c]) => {
        setEstudiantes(e);
        setCursos(c);
      })
      .catch((err) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    return estudiantes.filter((e) => {
      const matchesCourse = !curso || String(e.id_curso) === curso;
      const term = q.toLowerCase();
      const matchesQuery = !term
        || `${e.nombre} ${e.apellido}`.toLowerCase().includes(term)
        || e.documento.includes(term);
      return matchesCourse && matchesQuery && e.estado;
    });
  }, [estudiantes, curso, q]);

  async function guardar(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!selected) {
      setError('Seleccione un estudiante.');
      return;
    }
    setSaving(true);
    try {
      await api('/llegadas', {
        method: 'POST',
        body: JSON.stringify({
          id_estudiante: Number(selected),
          motivo,
          observacion,
        }),
      });
      setMessage('Llegada tarde registrada con fecha y hora automáticas.');
      setObservacion('');
      setEstudiantes(await api('/estudiantes'));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 className="font-display text-4xl">Registro de llegada tarde</h2>
      <p className="text-slate-500 mt-1">La fecha y hora se guardan automáticamente al confirmar.</p>

      <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-6">
        <section className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre o documento"
              className="rounded-xl border border-slate-200 px-3 py-2.5"
            />
            <select
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5"
            >
              <option value="">Todos los grupos</option>
              {cursos.map((c) => (
                <option key={c.id_curso} value={c.id_curso}>{c.nombre_curso}</option>
              ))}
            </select>
          </div>
          <div className="divide-y divide-slate-100 max-h-[520px] overflow-auto">
            {filtered.map((e) => (
              <label key={e.id_estudiante} className="flex items-center gap-3 py-3 cursor-pointer">
                <input
                  type="radio"
                  name="estudiante"
                  checked={String(selected) === String(e.id_estudiante)}
                  onChange={() => setSelected(e.id_estudiante)}
                />
                <div className="flex-1">
                  <p className="font-medium">{e.apellido}, {e.nombre}</p>
                  <p className="text-xs text-slate-500 font-mono">{e.documento} · {e.nombre_curso} · {e.total_llegadas} tardanzas</p>
                </div>
              </label>
            ))}
            {!filtered.length && <p className="py-8 text-sm text-slate-500">No hay estudiantes para esos filtros.</p>}
          </div>
        </section>

        <form onSubmit={guardar} className="bg-navy text-white rounded-2xl p-5 h-fit">
          <h3 className="font-display text-2xl">Confirmar</h3>
          {error && <p className="mt-3 rounded-lg bg-red-500/20 px-3 py-2 text-sm">{error}</p>}
          {message && <p className="mt-3 rounded-lg bg-gold/20 text-gold px-3 py-2 text-sm">{message}</p>}
          <label className="block text-sm mt-4 mb-1">Motivo</label>
          <select
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full rounded-xl bg-white text-slate-900 px-3 py-2.5"
          >
            {MOTIVOS.map((m) => <option key={m}>{m}</option>)}
          </select>
          <label className="block text-sm mt-4 mb-1">Observación</label>
          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            rows={4}
            className="w-full rounded-xl bg-white text-slate-900 px-3 py-2.5"
            placeholder="Opcional"
          />
          <button
            disabled={saving}
            className="mt-5 w-full rounded-xl bg-gold text-navy font-medium py-3 disabled:opacity-60"
          >
            {saving ? 'Guardando…' : 'Registrar tardanza'}
          </button>
        </form>
      </div>
    </div>
  );
}
