import type { ReactNode } from 'react'

interface SectionProps {
  title: string
  children: ReactNode
}

/** Sección de una página con su título. */
export function Section({ title, children }: SectionProps) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 px-4 text-xl font-bold md:px-6 md:text-2xl">{title}</h2>
      {children}
    </section>
  )
}

/**
 * Fila horizontal desplazable de tarjetas. Con espacio arriba y abajo para que el borde de foco (y la tarjeta
 * agrandada) no se corte; al moverse con el control, la fila se desplaza sola.
 */
export function CardRow({ children }: { children: ReactNode }) {
  return <div className="sin-scroll flex gap-4 overflow-x-auto px-4 py-3 md:px-6">{children}</div>
}
