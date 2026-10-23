import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { jamDevServer } from './server/jamDevServer'

// YouTube Music: SoundBlue TV usa el MISMO intermediario (Cloudflare Worker) que SoundBlue, también al probar en el
// PC (ver src/data/ytmusic.ts). El Worker acepta https://mikem4n.github.io y http://localhost:5173 / 4173: por eso
// las pruebas usan esos puertos (strictPort).

/**
 * Completa public/sw.js al compilar: le pasa la lista de archivos generados (con su hash)
 * y una versión nueva, para que la interfaz funcione sin conexión y se actualice sola.
 */
function serviceWorkerPrecache(): Plugin {
  let outDir = 'dist'
  let files: string[] = []
  return {
    name: 'soundblue-tv-sw-precache',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    generateBundle(_options, bundle) {
      files = Object.keys(bundle).filter((name) => !name.endsWith('.map') && name !== 'index.html')
    },
    closeBundle() {
      const swPath = resolve(outDir, 'sw.js')
      const version = createHash('sha256').update(files.sort().join('|')).digest('hex').slice(0, 10)
      const source = readFileSync(swPath, 'utf8')
        .replace('self.__ARCHIVOS__', JSON.stringify(files.map((name) => `./${name}`)))
        .replace('__VERSION__', version)
      writeFileSync(swPath, source)
    },
  }
}

export default defineConfig({
  // Se publicaría en https://mikem4n.github.io/soundblue-tv/ (en desarrollo: http://localhost:5173/soundblue-tv/).
  // Debe coincidir con el nombre del repositorio en GitHub; si no, los archivos dan 404.
  base: '/soundblue-tv/',
  // jamDevServer: las Jams (escuchar en grupo) mientras se prueba; ver server/jamDevServer.ts.
  plugins: [react(), tailwindcss(), serviceWorkerPrecache(), jamDevServer()],
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
})
