import Chart from 'chart.js/auto'
import { useEffect, useRef } from 'react'
import { formatoFecha, formatoNumero } from '../utilidades/formato.js'

// Único lugar del proyecto que usa Chart.js (ARQUITECTURA DEC-08): crea la gráfica en un efecto
// y la destruye al desmontarse, para no dejar gráficas vivas al cambiar de pantalla.
// Recibe los puntos en orden cronológico: [{ fecha: '2026-09-14', valor: 77.9 }, …]
export default function GraficaLinea({ puntos, unidad = 'kg', titulo = 'Evolución' }) {
  const lienzo = useRef(null)
  // El texto de los puntos es la dependencia del efecto: así no se redibuja en cada render
  const clave = JSON.stringify(puntos)

  useEffect(() => {
    const datos = JSON.parse(clave)
    const grafica = new Chart(lienzo.current, {
      type: 'line',
      data: {
        labels: datos.map((punto) => formatoFecha(punto.fecha, { diaSemana: false })),
        datasets: [
          {
            data: datos.map((punto) => punto.valor),
            borderColor: '#1f2937',
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#1f2937',
            pointBorderWidth: 2.5,
          },
        ],
      },
      options: {
        responsive: true,
        aspectRatio: 1.9,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (contexto) => `${formatoNumero(contexto.parsed.y)} ${unidad}` },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#57534e', font: { size: 10 } } },
          y: {
            grid: { color: '#e7e5e4' },
            border: { display: false },
            ticks: { color: '#78716c', font: { size: 10 }, callback: (valor) => formatoNumero(valor) },
          },
        },
      },
    })
    return () => grafica.destroy()
  }, [clave, unidad])

  return (
    <div className="grafica">
      <canvas ref={lienzo} role="img" aria-label={titulo} />
    </div>
  )
}
