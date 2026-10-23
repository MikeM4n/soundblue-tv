import { ChevronRight, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { LibraryList, useCreatePlaylist } from '../components/library/LibraryList'
import { IconButton } from '../components/ui/IconButton'

/** Tu biblioteca: «Tus me gusta» y tus playlists (también están en la barra lateral). */
export function Library() {
  const createPlaylist = useCreatePlaylist()
  return (
    <div className="px-2 pt-6 pb-10 md:px-4">
      <div className="flex items-center justify-between px-2">
        <h1 className="text-2xl font-bold md:text-3xl">Tu biblioteca</h1>
        <IconButton label="Crear playlist" onClick={createPlaylist.open}>
          <Plus className="size-6" />
        </IconButton>
      </div>
      <Link to="/gustos" className="mx-2 mt-1 inline-flex items-center gap-1 text-sm font-semibold text-acento-texto hover:underline">
        Cambiar tus artistas
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
      <div className="mt-4">
        <LibraryList coverSize="size-16" />
      </div>
      {createPlaylist.dialog}
    </div>
  )
}
