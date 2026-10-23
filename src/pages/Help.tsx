import type { ReactNode } from 'react'

// Cada sección se puede enfocar con el control remoto (tabIndex 0): así se baja por la ayuda con las flechas.
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section tabIndex={0} aria-labelledby={id} className="rounded-lg bg-tarjeta p-6">
      <h2 id={id} className="text-2xl font-bold">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-lg text-texto-sec">{children}</div>
    </section>
  )
}

const B = ({ children }: { children: ReactNode }) => <span className="font-semibold text-texto">{children}</span>

/** Ayuda de SoundBlue TV: el control remoto, cómo abrirla en el televisor y qué esperar del catálogo. */
export function Help() {
  return (
    <div className="mx-auto max-w-4xl space-y-5 px-6 pt-8 pb-12">
      <h1 className="text-4xl font-bold">Ayuda</h1>

      <Section id="ayuda-control" title="Con el control remoto">
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <B>Flechas</B>: te mueves por el menú, las listas y los botones. Lo elegido se marca con un <B>borde azul</B>.
          </li>
          <li>
            <B>OK</B>: reproduce la canción, abre el álbum o la playlist, o pulsa el botón marcado.
          </li>
          <li>
            <B>Atrás</B>: vuelve a la pantalla anterior (o cierra «A continuación»).
          </li>
          <li>
            En <B>«Sonando ahora»</B>: sobre la barra de progreso, <B>izquierda/derecha</B> atrasan o adelantan 10 segundos.
            <B> «A continuación»</B> abre la cola a la derecha y <B>«Ver video»</B> muestra el video oficial.
          </li>
          <li>
            En cada canción, a la derecha está su menú <B>⋮</B>: agregar a la cola, a una playlist o a «Tus me gusta».
          </li>
        </ul>
      </Section>

      <Section id="ayuda-abrir" title="Abrirla en el televisor">
        <p>
          Abre un navegador en tu Android TV o Google TV (si no tienes uno, instala uno desde la Play Store del televisor) y entra a la
          dirección de SoundBlue TV. Guárdala como favorito para abrirla rápido la próxima vez.
        </p>
        <p>También funciona en el computador conectado al televisor: usa las flechas del teclado como si fueran el control.</p>
      </Section>

      <Section id="ayuda-catalogo" title="Catálogo de YouTube Music">
        <p>
          SoundBlue busca en el catálogo de YouTube Music. Algunas pistas solo están disponibles en la app oficial de YouTube Music;
          para esas, usa el botón <B>«Abrir en YouTube Music»</B>. La búsqueda completa depende de un proxy no oficial que puede
          dejar de funcionar si YouTube cambia su API.
        </p>
        <p>Si un día no carga, la app sigue funcionando con la lista de prueba.</p>
      </Section>

      <Section id="ayuda-anuncios" title="Sobre los anuncios">
        <p>
          Las canciones suenan en el reproductor oficial de YouTube. En el televisor no hay bloqueador de anuncios, así que YouTube
          puede mostrar anuncios entre canciones.
        </p>
      </Section>

      <Section id="ayuda-jam" title="Jam: que tus amigos elijan la música">
        <p>
          Abre <B>Jam</B> en el menú y elige <B>Iniciar Jam</B>. En el televisor sale un código QR: tus amigos lo escanean con el
          celular, ponen su nombre y agregan canciones a la cola. La música suena en el televisor.
        </p>
      </Section>
    </div>
  )
}
