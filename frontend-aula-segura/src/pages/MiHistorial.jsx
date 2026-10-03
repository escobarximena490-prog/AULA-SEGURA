import { useEffect, useState } from 'react';
import { api } from '../api';

export default function MiHistorial() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/llegadas')
      .then(setRows)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h2 className="font-display text-4xl">Mi historial</h2>
      <p className="text-slate-500 mt-1">Solo se muestran los registros asociados a su cuenta.</p>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <div className="mt-6 bg-white rounded-2xl border overflow-hidden">
        {!rows.length ? (
          <p className="px-5 py-8 text-sm text-slate-500">Aún no hay llegadas tarde registradas.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Hora</th>
                <th className="px-5 py-3">Motivo</th>
                <th className="px-5 py-3">Observación</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id_llegada} className="border-t">
                  <td className="px-5 py-3 font-mono">{r.fecha}</td>
                  <td className="px-5 py-3 font-mono">{String(r.hora).slice(0, 8)}</td>
                  <td className="px-5 py-3">{r.motivo}</td>
                  <td className="px-5 py-3">{r.observacion || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
