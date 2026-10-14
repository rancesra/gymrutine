// Íconos de trazo simple (los mismos del mockup). Uso: <Icono nombre="inicio" />
const trazos = {
  inicio: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
  rutinas: 'M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11',
  historial: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  progreso: 'M4 4v16h16M7 15l4-4 3 3 5-6',
  perfil: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
  ojo: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
  atras: 'M15 5l-7 7 7 7',
  mas: 'M12 5v14M5 12h14',
  x: 'M6 6l12 12M18 6L6 18',
  basura: 'M4 7h16M9.5 7V4h5v3M6 7l1 13h10l1-13',
  lapiz: 'M4 20h4L19 9l-4-4L4 16z',
  arriba: 'M18 15l-6-6-6 6',
  abajo: 'M6 9l6 6 6-6',
  derecha: 'M9 5l7 7-7 7',
  externo: 'M14 4h6v6M20 4l-9 9M18 14v5H5V6h5',
  candado: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  buscar: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14M20 20l-4-4',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 11v5M12 8h.01',
  trofeo: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7',
}

export default function Icono({ nombre, tamano = 22 }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={trazos[nombre]} />
    </svg>
  )
}