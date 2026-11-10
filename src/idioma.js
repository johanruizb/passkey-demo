export const CLAVE_IDIOMA = 'passkey-demo:idioma';

export function resolverIdioma(guardado, navegador) {
  if (guardado === 'es' || guardado === 'en') return guardado;
  return String(navegador).toLowerCase().startsWith('en') ? 'en' : 'es';
}
