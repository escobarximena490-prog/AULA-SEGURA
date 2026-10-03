import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        if (user.tipo === 'usuario') {
          setData(await api('/reportes/resumen'));
        } else {
          setHistorial(await api('/llegadas'));
        }
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [user]);

  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  if (error) return <p className="text-red-600">{error}</p>;

  if (user.tipo === 'estudiante') {
    return (
      <div>
        <Welcome name={user.nombre} today={today} />
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <Stat title="Mis llegadas tarde" value={historial.length} />
          <Stat title="Último motivo" value={historial[0]?.motivo || '—'} />
        </div>
        <section className="mt-8 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <header className="px-5 py-4 border-b border-slate-100 flex justify-between">
            <h3 className="font-medium">Historial reciente</h3>
            <Link to="/mi-historial" className="text-sm text-navy">Ver todo</Link>
          </header>
          <Rows rows={historial.slice(0, 6)} student />
        </section>
      </div>
    );
  }

  const max = Math.max(1, ...(data?.semana || []).map((d) => Number(d.total)));

  return (
    <div>
      <Welcome name={user.nombre} today={today} />
      {!data ? <p className="mt-6 text-slate-500">Cargando panel…</p> : (
        <>
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat title="Tardanzas hoy" value={data.totales.tardanzas_hoy} accent />
            <Stat title="Estudiantes" value={data.totales.estudiantes_activos} />
            <Stat title="Grupos" value={data.totales.grupos} />
            <Stat title="Esta semana" value={data.totales.tardanzas_semana} />
          </div>
          <section className="mt-8 bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-medium mb-4">Tardanzas de la semana</h3>
            <WeekChart days={data.semana} max={max} />
          </section>
          <section className="mt-8 bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <header className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-medium">Registros recientes</h3>
            </header>
            <Rows rows={data.recientes} />
          </section>
        </>
      )}
    </div>
  );
}

function Welcome({ name, today }) {
  return (
    <div className="rounded-3xl bg-navy text-white p-6 lg:p-8">
      <p className="font-mono text-[11px] tracking-[0.22em] text-gold uppercase">Panel de control</p>
      <h2 className="font-display text-4xl mt-1">Hola, {name.split(' ')[0]}</h2>
      <p className="text-white/70 capitalize mt-2">{today}</p>
    </div>
  );
}

function Stat({ title, value, accent }) {
  return (
    <article className={`rounded-2xl p-4 border ${accent ? 'bg-gold/15 border-gold/40' : 'bg-white border-slate-200'}`}>
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <p className="font-display text-3xl mt-1">{value}</p>
    </article>
  );
}

function WeekChart({ days, max }) {
  const map = useMemo(() => {
    const lookup = Object.fromEntries((days || []).map((d) => [d.fecha, Number(d.total)]));
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const key = date.toISOString().slice(0, 10);
      return {
        label: date.toLocaleDateString('es-CO', { weekday: 'short' }),
        total: lookup[key] || 0,
      };
    });
  }, [days]);

  return (
    <div className="flex items-end gap-3 h-40">
      {map.map((day) => (
        <div key={day.label} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full bg-slate-100 rounded-t-lg h-32 flex items-end overflow-hidden">
            <div
              className="w-full bg-navy rounded-t-lg"
              style={{ height: `${Math.max(8, (day.total / max) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] uppercase text-slate-500">{day.label}</span>
        </div>
      ))}
    </div>
  );
}

function Rows({ rows, student }) {
  if (!rows?.length) {
    return <p className="px-5 py-8 text-sm text-slate-500">No hay registros todavía.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-slate-500 bg-slate-50">
          <tr>
            {!student && <th className="px-5 py-3 font-medium">Estudiante</th>}
            <th className="px-5 py-3 font-medium">Fecha</th>
            <th className="px-5 py-3 font-medium">Hora</th>
            <th className="px-5 py-3 font-medium">Motivo</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id_llegada} className="border-t border-slate-100">
              {!student && (
                <td className="px-5 py-3">{row.nombre} {row.apellido}</td>
              )}
              <td className="px-5 py-3 font-mono">{row.fecha}</td>
              <td className="px-5 py-3 font-mono">{String(row.hora).slice(0, 8)}</td>
              <td className="px-5 py-3">{row.motivo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
