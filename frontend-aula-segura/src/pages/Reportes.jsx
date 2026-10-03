import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Reportes() {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [porFecha, setPorFecha] = useState([]);
  const [porEstudiante, setPorEstudiante] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setError('');
    setLoading(true);
    try {
      const [day, totals] = await Promise.all([
        api(`/llegadas?fecha=${fecha}`),
        api(`/reportes/por-estudiante${queryRange(desde, hasta)}`),
      ]);
      setPorFecha(day);
      setPorEstudiante(totals);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function exportCsv() {
    const header = 'Documento,Nombre,Apellido,Curso,Total\n';
    const body = porEstudiante
      .map((r) => `${r.documento},${r.nombre},${r.apellido},${r.nombre_curso},${r.total_llegadas_tarde}`)
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte-llegadas-tarde.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function printReport() {
    window.print();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-4xl">Reportes</h2>
          <p className="text-slate-500 mt-1">Consulta por fecha y totales por estudiante.</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={exportCsv} className="rounded-xl border px-4 py-2 bg-white">Exportar CSV</button>
          <button onClick={printReport} className="rounded-xl bg-navy text-white px-4 py-2">Imprimir / PDF</button>
        </div>
      </div>
      {error && <p className="mt-4 text-red-600">{error}</p>}

      <section className="mt-6 bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-wrap gap-3 items-end">
          <label className="text-sm">
            Fecha
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="block mt-1 rounded-xl border px-3 py-2" />
          </label>
          <label className="text-sm">
            Desde
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="block mt-1 rounded-xl border px-3 py-2" />
          </label>
          <label className="text-sm">
            Hasta
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="block mt-1 rounded-xl border px-3 py-2" />
          </label>
          <button onClick={load} className="rounded-xl bg-navy text-white px-4 py-2">Consultar</button>
        </div>
      </section>

      <section className="mt-6 bg-white rounded-2xl border overflow-hidden">
        <header className="px-5 py-4 border-b">
          <h3 className="font-medium">Llegadas del {fecha}</h3>
        </header>
        <Table
          loading={loading}
          columns={['Estudiante', 'Documento', 'Curso', 'Hora', 'Motivo', 'Registró']}
          rows={porFecha.map((r) => [
            `${r.nombre} ${r.apellido}`,
            r.documento,
            r.nombre_curso,
            String(r.hora).slice(0, 8),
            r.motivo,
            r.registrado_por,
          ])}
        />
      </section>

      <section className="mt-6 bg-white rounded-2xl border overflow-hidden">
        <header className="px-5 py-4 border-b">
          <h3 className="font-medium">Total de llegadas tarde por estudiante</h3>
        </header>
        <Table
          loading={loading}
          columns={['Estudiante', 'Documento', 'Curso', 'Total']}
          rows={porEstudiante.map((r) => [
            `${r.nombre} ${r.apellido}`,
            r.documento,
            r.nombre_curso,
            r.total_llegadas_tarde,
          ])}
        />
      </section>
    </div>
  );
}

function queryRange(desde, hasta) {
  const params = new URLSearchParams();
  if (desde) params.set('desde', desde);
  if (hasta) params.set('hasta', hasta);
  const s = params.toString();
  return s ? `?${s}` : '';
}

function Table({ columns, rows, loading }) {
  if (loading) {
    return <p className="px-5 py-8 text-sm text-slate-500">Cargando…</p>;
  }
  if (!rows.length) {
    return <p className="px-5 py-8 text-sm text-slate-500">Sin resultados.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left bg-slate-50 text-slate-500">
          <tr>{columns.map((c) => <th key={c} className="px-5 py-3 font-medium">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-slate-100">
              {row.map((cell, j) => <td key={j} className="px-5 py-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
