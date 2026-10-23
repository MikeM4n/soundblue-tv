import { AudioLines } from 'lucide-react'
import { useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'
import { formatDuration } from '../../lib/format'
import { coverSources, sourceLabel, type Track } from '../../player/types'
import { onlyInYouTubeMusic } from '../../player/unavailable'
import { Cover } from '../ui/Cover'
import { TrackMenu } from './TrackMenu'
import type { RemoveAction } from './trackActions'

export interface TrackRowProps {
  track: Track
  onPlay: () => void
  position?: number // número a la izquierda (listas con encabezado)
  isCurrent?: boolean
  isPlaying?: boolean
  duration?: number
  removeAction?: RemoveAction // «Eliminar de…» en el menú ⋮
  trailing?: ReactNode
  style?: CSSProperties
}

/**
 * Fila de canción: portada, título, artista y menú «⋮». En la TV, sin gestos: con el control se elige la canción
 * (OK la reproduce) o, a la derecha, su menú (agregar a la cola, favoritos, playlist…).
 */
export function TrackRow({ track, onPlay, position, isCurrent, isPlaying, duration, removeAction, trailing, style }: TrackRowProps) {
  const shownDuration = duration ?? track.duration
  // YouTube no deja reproducirla fuera de sus apps: se avisa antes de elegirla (al elegirla se ofrece abrirla allá).
  const onlyInYtm = useSyncExternalStore(onlyInYouTubeMusic.subscribe, onlyInYouTubeMusic.get).has(track.id)

  return (
    <li className="relative rounded-md" style={style}>
      <div className="group relative flex h-16 items-center gap-3 rounded-md pr-1 pl-4 hover:bg-tarjeta">
        {position !== undefined && (
          <span className="w-6 shrink-0 text-center text-texto-sec tabular-nums" aria-hidden="true">
            {isPlaying ? <AudioLines className="mx-auto size-4 text-acento-texto" /> : <span className={isCurrent ? 'text-acento-texto' : ''}>{position}</span>}
          </span>
        )}
        <button type="button" onClick={onPlay} className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left" aria-label={`Reproducir ${track.title}, de ${track.artist}`}>
          <Cover seed={track.id} src={coverSources(track)} className="size-12 shrink-0 rounded" />
          <span className="min-w-0">
            <span className={`block truncate ${isCurrent ? 'text-acento-texto' : 'text-texto'}`}>{track.title}</span>
            <span className="flex items-center gap-1.5 text-sm text-texto-sec">
              <span className={`shrink-0 rounded px-1 text-xs font-semibold tracking-wide uppercase ${onlyInYtm ? 'bg-red-500/20 text-red-200' : 'bg-white/10'}`}>
                {onlyInYtm ? 'Solo en YouTube Music' : sourceLabel(track)}
              </span>
              <span className="truncate">
                {track.artist}
                {track.album && ` · ${track.album}`}
              </span>
            </span>
          </span>
        </button>
        {shownDuration ? <span className="w-12 shrink-0 text-right text-sm text-texto-sec tabular-nums">{formatDuration(shownDuration)}</span> : null}
        <TrackMenu track={track} removeAction={removeAction} />
        {trailing}
      </div>
    </li>
  )
}
