import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'
import { VideoStage } from '../player/VideoStage'
import { Toaster } from '../ui/Toaster'
import { PlayerBar } from './PlayerBar'
import { Sidebar } from './Sidebar'

/**
 * Armazón de SoundBlue TV, siempre en horizontal: barra lateral + contenido + reproductor fijo abajo, dentro del
 * margen de seguridad del televisor (tv-seguro: 5 % por lado). El orden en la página es el del control remoto:
 * barra lateral → contenido → reproductor. «Sonando ahora» en pantalla completa lo dibuja App encima de esto.
 * Sin lo que es solo del celular: barra inferior, mini-reproductor ni aviso para abrir la app en Brave.
 */
export function AppLayout() {
  const mainRef = useRef<HTMLElement>(null)
  const { pathname } = useLocation() // la página de fondo (no cambia al abrir «Sonando ahora»)

  // Al cambiar de sección, el contenido vuelve arriba.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="tv-seguro flex h-dvh flex-col gap-3 bg-fondo">
      <div className="flex min-h-0 flex-1 gap-3">
        <Sidebar />
        {/* min-w-0: sin esto los carruseles ensanchan la página */}
        <main ref={mainRef} className="scroll-fino min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain rounded-lg bg-panel">
          <Outlet />
        </main>
      </div>
      <PlayerBar />
      <VideoStage />
      <Toaster />
    </div>
  )
}
