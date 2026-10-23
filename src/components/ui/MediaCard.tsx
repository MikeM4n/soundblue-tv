import { Link } from 'react-router'
import { Cover } from './Cover'

interface MediaCardProps {
  title: string
  subtitle: string
  seed: string
  image?: string | readonly string[] // imagen o alternativas, en orden
  onPlay?: () => void
  to?: string // abre una página (playlist, álbum, artista) en vez de reproducir
  round?: boolean // imagen redonda, para artistas
}

/**
 * Tarjeta: portada, título y descripción. En la TV la tarjeta entera es el botón (OK la reproduce o abre su página):
 * sin el botón ▶ que aparece al pasar el mouse, que sería una parada extra para el control remoto.
 */
export function MediaCard({ title, subtitle, seed, image, onPlay, to, round = false }: MediaCardProps) {
  const content = (
    <>
      <Cover seed={seed} src={image} className={`aspect-square w-full shadow-lg shadow-black/40 ${round ? 'rounded-full' : 'rounded-md'}`} />
      <span className={`mt-3 block truncate font-semibold ${round ? 'text-center' : ''}`}>{title}</span>
      <span className={`mt-1 line-clamp-2 text-sm text-texto-sec ${round ? 'text-center' : ''}`}>{subtitle}</span>
    </>
  )
  return (
    <article className="group relative w-40 shrink-0 rounded-lg transition-colors hover:bg-tarjeta md:w-44">
      {to ? (
        <Link to={to} className="block w-full p-3 text-left">
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onPlay} className="block w-full p-3 text-left">
          {content}
        </button>
      )}
    </article>
  )
}
