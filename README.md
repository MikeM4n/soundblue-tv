# SoundBlue TV

Versión de SoundBlue para televisores (Android TV / Google TV y computadores conectados al televisor): el catálogo de YouTube Music en pantalla grande, siempre en horizontal y manejado con el control remoto.

Es un proyecto aparte, copiado de SoundBlue (`C:\Users\miguel.mancipe\Proyectos\blue-music`) el 23 de octubre de 2026. El proyecto original no se modifica desde aquí.

## Comandos

```bash
npm install        # solo la primera vez (la copia ya trae node_modules)
npm run dev        # http://localhost:5173/soundblue-tv/  (puerto fijo: el Worker solo acepta 5173 y 4173)
npm run build      # compila en dist/
npm run preview    # http://localhost:4173/soundblue-tv/
```

Para probar en el PC: abre la dirección y usa **las flechas del teclado** como el control remoto, **Enter** como OK y **Escape** como Atrás.

## YouTube Music: el mismo Worker de SoundBlue

No hay un intermediario aparte: `src/data/ytmusic.ts` usa el Cloudflare Worker de SoundBlue, `https://soundblue-ytm.miguelmancipe09.workers.dev` (se puede cambiar con `VITE_YTM_PROXY`). Su código vive en el proyecto original (`blue-music/worker/`).

- **CORS**: el Worker acepta por *origen* (protocolo + dominio + puerto, sin la ruta): `https://mikem4n.github.io`, `http://localhost:5173` y `http://localhost:4173`. SoundBlue TV publicada en `https://mikem4n.github.io/soundblue-tv/` tiene el mismo origen que SoundBlue, así que no hay que cambiar nada en Cloudflare. Solo habría que agregar orígenes nuevos si se prueba en otro puerto o en otra dirección (por ejemplo, la red local `http://10.…:5173`).
- **Cuota** (100 000 peticiones al día en el plan gratis, compartidas con SoundBlue): se usan las mismas cachés que el original: cada consulta se recuerda mientras la app está abierta (`remember()` en `ytmusic.ts`), «Para ti» guarda su última radio (`soundblue-tv:ultimas-radios`), las búsquedas de la Data API se guardan 24 h y las canciones que solo suenan en YouTube Music se recuerdan para no volver a intentarlas.

## Qué cambia frente a SoundBlue

- **Pantalla de TV (10-foot UI)**: diseño de pantalla grande siempre (barra lateral, contenido y reproductor abajo), aunque el navegador del televisor diga que mide 960 px. Todos los tamaños crecen con el ancho de la pantalla (`html { font-size: calc(100vw / 64) }`: 15 px a 960 px, 30 px a 1920 px).
- **Margen de seguridad (overscan)**: 5 % por lado (`tv-seguro` en `src/index.css`).
- **Control remoto (D-pad)**: `src/tv/useSpatialNavigation.ts`. Las flechas mueven el foco al elemento más cercano en esa dirección, primero dentro de la misma zona (menú, contenido, reproductor, panel) y con preferencia por la misma fila o columna; lo enfocado siempre queda a la vista (las listas y carruseles se desplazan solos). En la barra de progreso y el volumen, izquierda/derecha los mueven (10 s por pulsación en la barra). Dentro de «Sonando ahora» y de «A continuación» el foco no se sale.
- **Foco visible**: borde azul de 4 px (`#4169E1`), un poco más grande (`scale(1.05)`) y por encima de lo demás.
- **«Sonando ahora» de TV** (`src/components/player/TvNowPlaying.tsx`): carátula grande a la izquierda (o el video oficial con «Ver video»), título, artista, progreso y controles grandes a la derecha; «Me gusta»; «A continuación» abre la cola en un panel a la derecha sin tapar la carátula. Escape/Atrás cierra el panel o vuelve, y el foco regresa a la canción elegida.
- **Sin lo que es del celular**: barra inferior, mini-reproductor con gestos, deslizar carátulas y filas, aviso para abrir en Brave, ayuda de segundo plano/notificación/batería, registro de diagnóstico.
- **Pantalla encendida** activada por defecto: mientras suena música, el televisor no pone el protector de pantalla.
- **Datos separados**: claves `soundblue-tv:*` y copias del service worker `sbtv-*`, para no mezclarse con SoundBlue, que vive en el mismo `mikem4n.github.io`.
- **Manifest**: «SoundBlue TV», `display: fullscreen`, `orientation: landscape`.

## Publicar (cuando se decida)

`base: '/soundblue-tv/'`: el repositorio en GitHub tendría que llamarse `soundblue-tv`, y quedaría en <https://mikem4n.github.io/soundblue-tv/>. El flujo `.github/workflows/deploy.yml` ya está listo; este repositorio local todavía no está conectado a GitHub.
