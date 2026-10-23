// Detección del sistema y de la dirección desde donde se abrió la app.

export type Platform = 'android' | 'ios' | 'pc'

export function detectPlatform(): Platform {
  const ua = navigator.userAgent
  if (/Android/i.test(ua)) return 'android'
  // El iPad moderno se presenta como Mac, pero tiene pantalla táctil.
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  return 'pc'
}

/**
 * ¿La app se abrió desde una dirección de la red local (http://192.168…, 10.…, 172.16–31.…)? Así se prueba con
 * `npm run dev:red`, pero YouTube bloquea ahí casi toda la música de sellos (error 150): hace falta https.
 */
export function isLocalNetworkAddress(): boolean {
  return /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(window.location.hostname)
}

/** ¿Dirección que solo funciona en este PC o en esta red (localhost, 192.168…)? Tus amigos no podrían entrar. */
export function isPrivateAddress(): boolean {
  return isLocalNetworkAddress() || /^(localhost|127\.|\[::1\])/.test(window.location.hostname)
}
