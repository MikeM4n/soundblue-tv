import { ChevronLeft, ExternalLink, Heart, ListMusic, X } from 'lucide-react'
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode, type Ref } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useLibrary } from '../../library/store'
import { openInYouTubeMusic } from '../../lib/youtubeMusicLink'
import { sheetState, stagePulse, useStageSlot, youtubeView } from '../../player/stage'
import { coverSources, sourceLabel } from '../../player/types'
import { onlyInYouTubeMusic } from '../../player/unavailable'
import { usePlayer } from '../../player/usePlayer'
import { QueueSections } from '../tracks/QueueSections'
import { toggleFavorite } from '../tracks/trackActions'
import { Cover } from '../ui/Cover'
import { Backdrop } from './Backdrop'
import { SeekBar } from './SeekBar'
import { TransportControls } from './TransportControls'

/**
 * «Sonando ahora» para la TV, en horizontal y dentro del margen de seguridad: a la izquierda la carátula grande (o
 * el video oficial, si eliges «Video»); a la derecha título, artista, progreso (izquierda/derecha del control lo
 * adelantan o atrasan 10 s) y controles grandes. «A continuación» abre un panel a la derecha que no tapa la carátula.
 * Atrás/Escape cierra el panel o vuelve a la página anterior.
 */
export function TvNowPlaying() {
  const { current, contextName, error } = usePlayer()
  const { favorites } = useLibrary()
  const view = useSyncExternalStore(youtubeView.subscribe, youtubeView.get)
  const onlyInYtm = useSyncExternalStore(onlyInYouTubeMusic.subscribe, onlyInYouTubeMusic.get)
  const navigate = useNavigate()
  const location = useLocation()
  const videoSlot = useStageSlot('pantalla')
  const [queueOpen, setQueueOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const queueButtonRef = useRef<HTMLButtonElement>(null)
  // Lo que tenía el foco al abrir (la canción elegida), guardado en el primer dibujo: al cerrar, el foco vuelve ahí.
  const opener = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null)

  useEffect(() => {
    sheetState.set('open')
    stagePulse.emit()
    return () => {
      sheetState.set('closed')
      // Solo si de verdad se cerró (en desarrollo, React monta y desmonta una vez de prueba).
      window.setTimeout(() => {
        const el = opener.current
        if (!document.querySelector('[role="dialog"][aria-label="Sonando ahora"]') && el?.isConnected) el.focus({ preventScroll: true })
      }, 0)
    }
  }, [])
  // El foco va a ▶/⏸ (OK pausa o reproduce enseguida) en cuanto hay canción: la pantalla se abre justo antes de que
  // empiece a sonar.
  const hasTrack = !!current
  useEffect(() => {
    if (hasTrack) rootRef.current?.querySelector<HTMLElement>('button[aria-label="Pausar"], button[aria-label="Reproducir"]')?.focus()
  }, [hasTrack])

  const close = () => {
    const background = (location.state as { background?: unknown } | null)?.background
    if (background) navigate(-1)
    else navigate('/', { replace: true })
  }
  const closeQueue = () => {
    setQueueOpen(false)
    queueButtonRef.current?.focus()
  }
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' && e.key !== 'Backspace' && e.key !== 'GoBack') return
    if ((e.target as HTMLElement).closest('input, [role="menu"]')) return
    e.preventDefault()
    if (queueOpen) closeQueue()
    else close()
  }

  if (!current) {
    return (
      <div role="dialog" aria-modal="true" aria-label="Sonando ahora" className="tv-seguro fixed inset-0 z-30 grid place-items-center bg-fondo">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-2xl font-semibold">No hay nada sonando</p>
          <TvButton onClick={close} icon={<ChevronLeft className="size-6" />}>
            Volver
          </TvButton>
        </div>
      </div>
    )
  }

  const liked = favorites.some((t) => t.id === current.id)
  const showVideo = view === 'video'
  const blocked = !!error && onlyInYtm.has(current.id)

  return (
    <div ref={rootRef} role="dialog" aria-modal="true" aria-label="Sonando ahora" onKeyDown={onKeyDown} className="fixed inset-0 z-30 overflow-hidden bg-fondo text-white">
      <Backdrop track={current} />
      <div className="tv-seguro relative flex h-full items-center gap-[4vw]">
        {/* Izquierda: la carátula (cuadrada, lo más grande que quepa) o el espacio del video (16:9). */}
        <div className="grid h-full w-[46%] shrink-0 place-items-center [container-type:size]">
          {showVideo ? (
            <div ref={videoSlot} className="aspect-video w-full rounded-xl" />
          ) : (
            <Cover seed={current.id} src={coverSources(current, 'large')} eager className="aspect-square w-[min(100cqw,100cqh)] rounded-xl shadow-2xl shadow-black/60" />
          )}
        </div>

        {/* Derecha: lo que suena y los controles, grandes para verse desde lejos. */}
        <div className="flex min-w-0 flex-1 flex-col gap-[2.5vh]">
          <p className="truncate text-base tracking-wider text-white/70 uppercase">
            Sonando desde · <span className="font-bold text-white">{contextName ?? 'Tu música'}</span>
          </p>
          <h1 className="line-clamp-2 text-5xl leading-tight font-bold break-words">{current.title}</h1>
          <p className="truncate text-2xl text-texto-sec">{current.artist}</p>
          {blocked ? (
            <div role="alert" className="flex flex-wrap items-center gap-4 text-lg">
              <span className="text-red-300">Esta canción solo se puede escuchar en YouTube Music.</span>
              <TvButton onClick={() => openInYouTubeMusic(current.id)} icon={<ExternalLink className="size-6" />}>
                Abrir en YouTube Music
              </TvButton>
            </div>
          ) : error ? (
            <p role="alert" className="truncate text-lg text-red-300">
              {error}
            </p>
          ) : (
            <p className="truncate text-lg text-white/50">{[current.album, sourceLabel(current)].filter(Boolean).join(' · ')}</p>
          )}
          <SeekBar className="text-base" />
          <div className="flex justify-center">
            <TransportControls large />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <TvButton onClick={() => toggleFavorite(current)} active={liked} icon={<Heart className={`size-6 ${liked ? 'fill-current' : ''}`} />}>
              {liked ? 'Te gusta' : 'Me gusta'}
            </TvButton>
            <TvButton onClick={() => youtubeView.set(showVideo ? 'cancion' : 'video')}>{showVideo ? 'Ver carátula' : 'Ver video'}</TvButton>
            <TvButton ref={queueButtonRef} onClick={() => setQueueOpen(true)} icon={<ListMusic className="size-6" />}>
              A continuación
            </TvButton>
            <TvButton onClick={close} icon={<ChevronLeft className="size-6" />}>
              Volver
            </TvButton>
          </div>
        </div>
      </div>

      {/* «A continuación»: panel a la derecha, encima de los controles (la carátula sigue a la vista). */}
      {queueOpen && <QueueSidePanel onClose={closeQueue} />}
    </div>
  )
}

function QueueSidePanel({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    // El foco entra al panel: primero la primera canción (o «Cerrar», si no hay ninguna).
    const panel = ref.current
    ;(panel?.querySelector<HTMLElement>('li button') ?? panel?.querySelector<HTMLElement>('button'))?.focus()
  }, [])
  return (
    <aside ref={ref} data-nav-scope aria-label="A continuación" className="absolute inset-y-0 right-0 flex w-[46%] flex-col bg-elevado py-[5vh] pr-[5vw] pl-[2vw] shadow-2xl shadow-black">
      <header className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold">A continuación</h2>
        <TvButton onClick={onClose} icon={<X className="size-6" />}>
          Cerrar
        </TvButton>
      </header>
      <div className="scroll-fino min-h-0 flex-1 overflow-y-auto px-1 pb-4">
        <QueueSections />
      </div>
    </aside>
  )
}

interface TvButtonProps {
  onClick: () => void
  icon?: ReactNode
  active?: boolean
  children: ReactNode
  ref?: Ref<HTMLButtonElement>
}

/** Botón grande con texto, cómodo para el control remoto. */
function TvButton({ onClick, icon, active = false, children, ref }: TvButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-pressed={active || undefined}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-lg font-semibold transition-colors ${
        active ? 'bg-acento text-white' : 'bg-white/10 text-white hover:bg-white/20'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}
