import { useState } from 'react';

const tabs = [
  { id: 'rf', label: 'RF' },
  { id: 'rnf', label: 'RNF' },
  { id: 'bd', label: 'BD' },
  { id: 'hu', label: 'HU' },
];

export default function Documentacion() {
  const [tab, setTab] = useState('rf');

  return (
    <div>
      <h2 className="font-display text-4xl">Documentación</h2>
      <p className="text-slate-500 mt-1">Resumen operativo alineado a LLEGAPP / Aula Segura.</p>
      <div className="mt-6 flex gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`rounded-full px-4 py-2 text-sm ${tab === item.id ? 'bg-navy text-white' : 'bg-white border'}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-6 bg-white rounded-2xl border p-5 space-y-3 text-sm">
        {tab === 'rf' && (
          <List
            items={[
              'Crear e iniciar sesión con cuentas de personal y de estudiante.',
              'Registrar estudiantes, cursos y llegadas tarde con fecha/hora automáticas.',
              'Consultar historial propio o de todos los estudiantes según el rol.',
              'Buscar por nombre, documento o grado y generar reportes.',
              'Activar o desactivar cuentas e identificar quién hizo cada registro.',
            ]}
          />
        )}
        {tab === 'rnf' && (
          <List
            items={[
              'Interfaz sencilla, usable en computador y móvil (PWA).',
              'Autenticación JWT y contraseñas cifradas con bcrypt.',
              'Base de datos MySQL en Clever Cloud.',
              'Validación de datos, prevención de registros duplicados del mismo día.',
              'Respuesta rápida mediante consultas indexadas y API REST.',
            ]}
          />
        )}
        {tab === 'bd' && (
          <List
            items={[
              'curso: id_curso, nombre_curso, grado, grupo.',
              'estudiante: documento único, nombre, apellido, curso, estado.',
              'usuario y cuenta_usuario: personal autorizado con correo y rol.',
              'cuenta_estudiante: acceso individual asociado a un estudiante.',
              'llegada_tarde: estudiante, usuario, fecha, hora, motivo y observación.',
            ]}
          />
        )}
        {tab === 'hu' && (
          <List
            items={[
              'HU01-HU02: cuentas de usuario autorizado y de estudiante.',
              'HU03-HU04: registrar estudiante y llegada tarde.',
              'HU05-HU06: historial propio y consulta administrativa.',
              'HU07-HU09: búsqueda, consulta por fecha y reportes.',
              'HU10-HU11: inicio de sesión seguro y total de retrasos.',
            ]}
          />
        )}
      </div>
    </div>
  );
}

function List({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="pl-4 border-l-2 border-gold">{item}</li>
      ))}
    </ul>
  );
}
