import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api/cliente.js'
import { useAuth } from '../auth/useAuth.js'
import Cargando from '../componentes/Cargando.jsx'
import Icono from '../componentes/Icono.jsx'
import { leerBorradores } from '../utilidades/borrador.js'
import { formatoFecha, formatoKg, formatoNumero } from '../utilidades/formato.js'
import { nombreDe, obtenerReferencias } from '../utilidades/referencias.js'

// P3 Inicio (tarea T11). Reglas: docs/mockup/README.md, sección P3.
// Resume lo de cada sección; cada bloque falla por separado, para que la pantalla no se caiga entera.
export default function PaginaInicio() {
  const { usuario } = useAuth()
  const [rutinas, setRutinas] = useState(null)
  const [sesiones, setSesiones] = useState(null)
  const [records, setRecords] = useState(null)
  const [pesos, setPesos] = useState(null)
  const [referencias, setReferencias] = useState(null)
  const [pendientes] = useState(leerBorradores)

  useEffect(() => {
    api.get('/rutinas').then(setRutinas, () => setRutinas([]))
    api.get('/sesiones').then(setSesiones, () => setSesiones([]))
    api.get('/records').then(setRecords, () => setRecords([]))
    api.get('/peso-corporal').then(setPesos, () => setPesos([]))
    obtenerReferencias().then(setReferencias, () => setReferencias(null))
  }, [])

  const cargando = rutinas === null || sesiones === null || records === null || pesos === null
  const activas = (rutinas ?? []).slice(0, 3) // GET /rutinas ya devuelve solo las activas
  const ultima = (sesiones ?? [])[0]
  // Los tres récords más recientes, que son los que vale la pena recordar
  const recientes = [...(records ?? [])].sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio)).slice(0, 3)
  const peso = (pesos ?? [])[pesos?.length - 1]
  const pesoAnterior = (pesos ?? [])[pesos?.length - 2]

  return (
    <section className="pagina num">
      <div>
        <h1>Hola, {usuario?.nombre?.split(' ')[0]}</h1>
        {referencias && usuario && (
          <span className="texto-2">Tu objetivo: {nombreDe(referencias.objetivos, usuario.objetivo)}</span>
        )}
      </div>

      {/* Un entrenamiento que quedó a medias (P7 guarda un borrador por rutina) */}
      {pendientes.map((pendiente) => (
        <div key={pendiente.rutinaId} className="aviso alerta">
          <span>Tienes un entrenamiento sin guardar</span>
          <Link to={`/rutinas/${pendiente.rutinaId}/entrenar`} className="btn btn-secundario btn-sm">
            Continuar
          </Link>
        </div>
      ))}

      {cargando ? (
        <Cargando texto="Cargando tu resumen…" />
      ) : (
        <>
          <Bloque titulo="Entrenar hoy" enlace={activas.length > 0 ? { a: '/rutinas', texto: 'Ver todas' } : null}>
            {activas.length === 0 ? (
              <Invitacion
                texto="Arma tu primera rutina para empezar a entrenar."
                boton={{ a: '/rutinas/nueva', texto: 'Crear mi primera rutina' }}
              />
            ) : (
              <div className="lista">
                {activas.map((rutina) => (
                  <div key={rutina.id} className="lista-fila">
                    <div className="crece">
                      <b>{rutina.nombre}</b>
                      <div className="texto-3">
                        {referencias ? nombreDe(referencias.objetivos, rutina.objetivo) : rutina.objetivo}
                        {` · ${rutina.cantidadEjercicios} ${rutina.cantidadEjercicios === 1 ? 'ejercicio' : 'ejercicios'}`}
                      </div>
                    </div>
                    <Link to={`/rutinas/${rutina.id}/entrenar`} className="btn btn-primario btn-sm">
                      Entrenar
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Bloque>

          <Bloque titulo="Tu último entrenamiento" enlace={ultima ? { a: '/historial', texto: 'Ver historial' } : null}>
            {!ultima ? (
              <Invitacion texto="Cuando registres una sesión, aquí verás la última." />
            ) : (
              <Link to={`/historial/${ultima.id}`} className="tarjeta tarjeta-enlace">
                <span className="texto-3 fecha-tarjeta">{formatoFecha(ultima.fechaInicio, { anio: true })}</span>
                <span className="entre">
                  <h3 className="titulo-tarjeta">{ultima.rutina.nombre}</h3>
                  {ultima.resumen.records > 0 && (
                    <span className="etiqueta record">
                      <Icono nombre="trofeo" tamano={14} />
                      {ultima.resumen.records === 1 ? '1 récord' : `${ultima.resumen.records} récords`}
                    </span>
                  )}
                </span>
                <span className="texto-2">
                  {ultima.duracionMinutos} min · {ultima.resumen.series} series · {formatoKg(ultima.resumen.volumenKg)}
                </span>
              </Link>
            )}
          </Bloque>

          <Bloque
            titulo="Tus récords"
            enlace={recientes.length > 0 ? { a: '/progreso/records', texto: 'Ver todos' } : null}
          >
            {recientes.length === 0 ? (
              <Invitacion texto="Aún no tienes récords. ¡Registra tu primera sesión!" />
            ) : (
              <div className="lista">
                {recientes.map((record) => (
                  <div key={record.ejercicio.id} className="lista-fila">
                    <div className="crece">
                      <b>{record.ejercicio.nombre}</b>
                      <div className="texto-3">{formatoFecha(record.fechaInicio, { anio: true })}</div>
                    </div>
                    <span className="etiqueta record">
                      <Icono nombre="trofeo" tamano={14} />
                      {formatoKg(record.pesoKg)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Bloque>

          <Bloque titulo="Tu peso" enlace={{ a: '/progreso/peso', texto: peso ? 'Ver evolución' : 'Registrar' }}>
            {!peso ? (
              <Invitacion texto="Registra tu peso para ver cómo evoluciona." />
            ) : (
              <div className="tarjeta entre">
                <div>
                  <b className="bloque">{formatoKg(peso.pesoKg)}</b>
                  <span className="texto-3">{formatoFecha(peso.fecha, { anio: true })}</span>
                </div>
                {pesoAnterior && <span className="etiqueta">{diferencia(peso, pesoAnterior)}</span>}
              </div>
            )}
          </Bloque>
        </>
      )}
    </section>
  )
}

// La diferencia contra el registro anterior, igual que en P13: en gris, sin juzgar si subió o bajó
function diferencia(registro, anterior) {
  const cambio = registro.pesoKg - anterior.pesoKg
  if (cambio === 0) return '='
  return `${cambio > 0 ? '+' : '−'}${formatoNumero(Math.abs(cambio))}`
}

function Bloque({ titulo, enlace, children }) {
  return (
    <div>
      <div className="entre">
        <h2 className="titulo-bloque">{titulo}</h2>
        {enlace && (
          <Link to={enlace.a} className="texto-2">
            {enlace.texto}
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}

function Invitacion({ texto, boton }) {
  return (
    <div className="tarjeta acciones">
      <p className="texto-2 sin-margen">{texto}</p>
      {boton && (
        <Link to={boton.a} className="btn btn-primario btn-bloque">
          {boton.texto}
        </Link>
      )}
    </div>
  )
}
