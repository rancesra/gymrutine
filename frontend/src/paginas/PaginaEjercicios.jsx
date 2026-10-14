import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api/cliente.js'
import { useAuth } from '../auth/useAuth.js'
import Cargando from '../componentes/Cargando.jsx'
import DetalleEjercicio from '../componentes/DetalleEjercicio.jsx'
import FormularioEjercicio from '../componentes/FormularioEjercicio.jsx'
import Icono from '../componentes/Icono.jsx'
import MensajeError from '../componentes/MensajeError.jsx'
import { nombreDe, obtenerReferencias } from '../utilidades/referencias.js'

// P4 Catálogo de ejercicios (historias H5 a H9). Reglas: docs/mockup/README.md, sección P4.
// El equipo y "recomendados" se piden a la API; la búsqueda por nombre se hace en el navegador.
export default function PaginaEjercicios() {
  const { usuario } = useAuth()
  const [referencias, setReferencias] = useState(null)
  const [ejercicios, setEjercicios] = useState(null)
  const [error, setError] = useState(null)
  const [intento, setIntento] = useState(0) // cambia al reintentar o después de guardar, y la lista se vuelve a pedir
  const [busqueda, setBusqueda] = useState('')
  const [equipo, setEquipo] = useState('')
  const [soloRecomendados, setSoloRecomendados] = useState(false)
  const [abiertos, setAbiertos] = useState([]) // grupos musculares desplegados
  // Lo que se ve encima de la lista: { tipo: 'detalle', id } o { tipo: 'formulario', ejercicio } (null al crear)
  const [hoja, setHoja] = useState(null)

  const objetivo = usuario?.objetivo

  useEffect(() => {
    const parametros = new URLSearchParams()
    if (equipo) parametros.set('equipo', equipo)
    if (soloRecomendados && objetivo) parametros.set('objetivo', objetivo)
    const consulta = parametros.size > 0 ? `?${parametros}` : ''
    Promise.all([obtenerReferencias(), api.get(`/ejercicios${consulta}`)])
      .then(([refs, lista]) => {
        setReferencias(refs)
        setEjercicios(lista)
        setError(null)
      })
      .catch(setError)
  }, [equipo, soloRecomendados, objetivo, intento])

  function recargar() {
    setIntento(intento + 1)
  }

  function alternarGrupo(codigo) {
    setAbiertos(abiertos.includes(codigo) ? abiertos.filter((g) => g !== codigo) : [...abiertos, codigo])
  }

  // Después de crear o editar se abre el detalle del ejercicio guardado
  function alGuardar(guardado) {
    recargar()
    setHoja({ tipo: 'detalle', id: guardado.id })
  }

  function alEliminar() {
    recargar()
    setHoja(null)
  }

  const texto = normalizar(busqueda)
  const visibles = (ejercicios ?? []).filter((ejercicio) => normalizar(ejercicio.nombre).includes(texto))
  // Un grupo por cada grupo muscular, en el orden de GET /referencias; los vacíos no se muestran
  const grupos = (referencias?.gruposMusculares ?? [])
    .map((grupo) => ({ ...grupo, ejercicios: visibles.filter((e) => e.grupoMuscular === grupo.codigo) }))
    .filter((grupo) => grupo.ejercicios.length > 0)

  return (
    <>
      <section className="pagina">
        <div className="encabezado">
          <Link to="/rutinas" className="btn-volver" aria-label="Volver a mis rutinas">
            <Icono nombre="atras" />
          </Link>
          <h1 className="crece">Catálogo de ejercicios</h1>
          <button
            type="button"
            className="btn-volver btn-icono naranja"
            aria-label="Crear un ejercicio propio"
            onClick={() => setHoja({ tipo: 'formulario', ejercicio: null })}
          >
            <Icono nombre="mas" />
          </button>
        </div>

        <span className="entrada">
          <Icono nombre="buscar" tamano={18} />
          <input
            type="search"
            placeholder="Buscar por nombre"
            aria-label="Buscar por nombre"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </span>

        {referencias && (
          <>
            <label className="entre">
              <span className="texto-2">
                Solo recomendados para <b>{nombreDe(referencias.objetivos, objetivo)}</b>
              </span>
              <input
                type="checkbox"
                role="switch"
                className="interruptor"
                checked={soloRecomendados}
                onChange={(evento) => setSoloRecomendados(evento.target.checked)}
              />
            </label>

            <div className="chips" role="group" aria-label="Equipo">
              {[{ codigo: '', nombre: 'Todos' }, ...referencias.equipos].map((opcion) => (
                <button
                  key={opcion.codigo || 'todos'}
                  type="button"
                  className={equipo === opcion.codigo ? 'chip activo' : 'chip'}
                  aria-pressed={equipo === opcion.codigo}
                  onClick={() => setEquipo(opcion.codigo)}
                >
                  {opcion.nombre}
                </button>
              ))}
            </div>
          </>
        )}

        {error ? (
          <MensajeError error={error} alReintentar={recargar} />
        ) : ejercicios === null ? (
          <Cargando texto="Cargando el catálogo…" />
        ) : grupos.length === 0 ? (
          <p className="texto-2 centrado">Ningún ejercicio cumple el filtro.</p>
        ) : (
          grupos.map((grupo) => {
            // Mientras se busca, todos los grupos con resultados se ven abiertos
            const abierto = texto !== '' || abiertos.includes(grupo.codigo)
            return (
              <div key={grupo.codigo} className="lista">
                <button
                  type="button"
                  className="lista-cab cabecera-boton"
                  aria-expanded={abierto}
                  onClick={() => alternarGrupo(grupo.codigo)}
                >
                  <span>
                    {grupo.nombre} <span className="texto-3">{grupo.ejercicios.length}</span>
                  </span>
                  <Icono nombre={abierto ? 'abajo' : 'derecha'} tamano={18} />
                </button>
                {abierto &&
                  grupo.ejercicios.map((ejercicio) => (
                    <button
                      key={ejercicio.id}
                      type="button"
                      className="lista-fila fila-boton"
                      onClick={() => setHoja({ tipo: 'detalle', id: ejercicio.id })}
                    >
                      <span className="crece">{ejercicio.nombre}</span>
                      {ejercicio.propio && <span className="etiqueta propio">Propio</span>}
                      <span className="etiqueta gris">{nombreDe(referencias.equipos, ejercicio.equipo)}</span>
                    </button>
                  ))}
              </div>
            )
          })
        )}
      </section>

      {hoja?.tipo === 'detalle' && (
        <DetalleEjercicio
          id={hoja.id}
          referencias={referencias}
          alCerrar={() => setHoja(null)}
          alEditar={(ejercicio) => setHoja({ tipo: 'formulario', ejercicio })}
          alEliminar={alEliminar}
        />
      )}
      {hoja?.tipo === 'formulario' && (
        <FormularioEjercicio
          ejercicio={hoja.ejercicio}
          referencias={referencias}
          objetivoInicial={objetivo}
          alCerrar={() => setHoja(hoja.ejercicio ? { tipo: 'detalle', id: hoja.ejercicio.id } : null)}
          alGuardar={alGuardar}
        />
      )}
    </>
  )
}

// Sin mayúsculas ni tildes: "Extensión" y "extension" coinciden
function normalizar(texto) {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}
