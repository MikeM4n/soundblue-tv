import type { ReactNode } from 'react'
import { player } from '../../player/engine'
import type { Track } from '../../player/types'
import { usePlayer } from '../../player/usePlayer'
import { showToast } from '../../ui/toast'
import { stableKeys } from './TrackList'
import { TrackRow } from './TrackRow'
import type { RemoveAction } from './trackActions'

/**
 * «Siguiente en la cola» (las que agregaste) y «Siguiente de: …» (el resto de la lista). Con el control: OK salta a
 * esa canción y su menú ⋮ la quita de la cola (con Deshacer). La usan la página Cola y el panel «A continuación».
 */
export function QueueSections({ beforePlay }: { beforePlay?: () => void }) {
  const { queue, upcoming, contextName } = usePlayer()

  const clearQueue = () => {
    const undo = player.clearQueue()
    showToast('Cola vaciada', { label: 'Deshacer', run: undo })
  }

  if (queue.length === 0 && upcoming.length === 0) {
    return <p className="mt-6 px-2 text-texto-sec">No hay más canciones. En cualquier lista, usa ⋮ → «Agregar a la cola».</p>
  }

  return (
    <>
      {queue.length > 0 && (
        <>
          <SectionTitle
            action={
              <button type="button" onClick={clearQueue} className="shrink-0 text-sm text-texto-sec hover:text-texto">
                Vaciar cola
              </button>
            }
          >
            Siguiente en la cola
          </SectionTitle>
          <QueueList
            tracks={queue}
            onPlay={(i) => {
              beforePlay?.()
              player.jumpToQueue(i)
            }}
            remove={(i) => ({ listName: 'la cola', remove: () => player.removeQueueAt(i) })}
          />
        </>
      )}
      {upcoming.length > 0 && (
        <>
          <SectionTitle>Siguiente de: {contextName}</SectionTitle>
          <QueueList
            tracks={upcoming}
            onPlay={(i) => {
              beforePlay?.()
              player.jumpToUpcoming(i)
            }}
            remove={(i) => ({ listName: 'la cola', remove: () => player.removeUpcomingAt(i) })}
          />
        </>
      )}
    </>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mt-6 mb-1 flex items-center justify-between px-2">
      <h2 className="truncate font-bold">{children}</h2>
      {action}
    </div>
  )
}

interface QueueListProps {
  tracks: readonly Track[]
  onPlay: (index: number) => void
  remove: (index: number) => RemoveAction
}

// Sin el asa para arrastrar del celular: en la TV las flechas sirven para moverse entre canciones, no para reordenar.
function QueueList({ tracks, onPlay, remove }: QueueListProps) {
  const keys = stableKeys(tracks)
  return (
    <ol>
      {tracks.map((track, i) => (
        <TrackRow key={keys[i]} track={track} onPlay={() => onPlay(i)} removeAction={remove(i)} />
      ))}
    </ol>
  )
}
