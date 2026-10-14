import { Link } from 'react-router'
import { formatoKg, formatoNumero } from '../utilidades/formato.js'
import Icono from './Icono.jsx'

// P8 Resumen de la sesión (historias H14 y H18). Reglas: docs/mockup/README.md, sección P8.
// Muestra la respuesta 201 de POST /sesiones, sin peticiones nuevas.
// recordsPrevios: { [ejercicioId]: recordKg } tal como se cargaron al abrir P7, para la "marca anterior".
export default function ResumenSesion({ sesion, recordsPrevios }) {
  const { resumen } = sesion
  const nuevosRecords = sesion.registros.flatMap((registro) =>
    registro.series.filter((serie) => serie.esRecord).map((serie) => ({ ejercicio: registro.ejercicio, serie })),
  )

  return (
    <main className="pantalla-entrenar pagina num">
      <div className="guardada">
        <span className="circulo">
          <Icono nombre="check" tamano={44} />
        </span>
        <h1>¡Sesión guardada!</h1>
        <span className="texto-2">
          {sesion.rutina.nombre} · {sesion.duracionMinutos} min
        </span>
      </div>

      <div className="kpis">
        <Kpi titulo="Volumen" valor={formatoKg(resumen.volumenKg)} />
        <Kpi titulo="Ejercicios" valor={resumen.ejercicios} />
        <Kpi titulo="Series" valor={resumen.series} />
        <Kpi titulo="Repeticiones" valor={formatoNumero(resumen.repeticiones)} />
      </div>

      {nuevosRecords.length > 0 ? (
        <div className="tarjeta nuevo-record">
          <span className="fila">
            <Icono nombre="trofeo" />
            <b>{nuevosRecords.length === 1 ? '¡Nuevo récord!' : '¡Nuevos récords!'}</b>
          </span>
          {nuevosRecords.map(({ ejercicio, serie }) => {
            const anterior = recordsPrevios[ejercicio.id]
            return (
              <div key={ejercicio.id}>
                <span className="entre">
                  <span>{ejercicio.nombre}</span>
                  <b>
                    {formatoKg(serie.pesoKg)} × {serie.repeticiones}
                  </b>
                </span>
                <span className="texto-3">
                  {anterior == null ? 'Es tu primera marca en este ejercicio' : `Tu marca anterior era ${formatoKg(anterior)}`}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="tarjeta texto-2 centrado">Esta vez no hubo récords</div>
      )}

      <div className="kpis">
        <Link to={`/historial/${sesion.id}`} className="btn btn-secundario">
          Ver detalle
        </Link>
        <Link to="/" className="btn btn-primario">
          Ir a inicio
        </Link>
      </div>
    </main>
  )
}

function Kpi({ titulo, valor }) {
  return (
    <div className="kpi">
      <small>{titulo}</small>
      <b>{valor}</b>
    </div>
  )
}
