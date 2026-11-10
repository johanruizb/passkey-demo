# Passkey Demo

Un banco de pruebas público para probar una passkey real en el navegador. Sin
cuentas, sin contraseñas, sin backend y sin enviar datos a ningún sitio.

**Demo:** <https://johanruizb.github.io/passkey-demo/>

La interfaz está en español y en inglés. En la primera visita se usa el idioma
del navegador y puedes cambiarlo desde la cabecera; la elección se recuerda.

La página crea una passkey de verdad, cierra la sesión y vuelve a entrar con
Face ID, huella, Windows Hello o una llave física. El panel oscuro enseña lo
que un servidor guardaría: la clave pública, el identificador de la credencial
y el contador. La clave privada nunca sale del autenticador.

## Qué se puede probar

1. **Crear una passkey.** Escribe un nombre y aprueba el aviso del sistema.
2. **Cerrar la sesión.** La passkey sigue en el dispositivo; lo que desaparece
   es la sesión de esta pestaña.
3. **Entrar con la passkey.** Un toque y el autenticador del sistema. No hay
   correo, contraseña ni código.

El botón «Borrar los datos de esta demo» limpia el registro local para repetir
la prueba. No borra la passkey del llavero del sistema; para eso hay que usar
la configuración de passkeys del dispositivo.

## Cómo funciona

Este repositorio es un sitio estático. No hay servidor: la página actúa como
parte confiable (RP) y verifica la firma en el navegador con
[SimpleWebAuthn](https://simplewebauthn.dev/).

- El RP ID es `location.hostname` y el origen esperado es `location.origin`.
- Los usuarios y las credenciales se guardan en `localStorage`, como un
  servidor simulado.
- La sesión vive en `sessionStorage`: se cierra al cerrar la pestaña o al pulsar
  «Cerrar sesión».
- La verificación de la firma es real. Lo simulado es el servidor que guarda la
  clave pública.

El bundle se genera con esbuild e incluye `@simplewebauthn/browser` y
`@simplewebauthn/server`. El segundo se usa en el navegador porque solo necesita
verificar la respuesta de WebAuthn, no atender peticiones HTTP.

## Límites

- **No es un sistema de autenticación para producción.** No hay base de datos,
  rate limit, auditoría, recuperación de cuenta ni cuentas reales.
- **El servidor simulado es de este navegador.** Si creas la passkey en Safari y
  abres el sitio en la app instalada en iOS, el segundo contexto tiene otro
  `localStorage` y no conoce la clave pública. La passkey puede estar en
  iCloud Keychain, pero esta demo no puede verificarla sin el registro del
  servidor. En producción el registro vive en el servidor y la passkey sí
  cruza esos contextos.
- **No hay recuperación.** Si pierdes el dispositivo, pierdes el acceso. Una app
  real necesita un camino de recuperación, por ejemplo un código por correo.
- **Los navegadores internos no son fiables.** Gmail, WhatsApp, Instagram y
  otros WebViews pueden no ofrecer WebAuthn. Abre la demo en Safari, Chrome,
  Edge o Firefox.
- **El reset no borra la passkey.** Borra el registro del servidor simulado. La
  credencial sigue en el llavero hasta que la elimines desde el sistema.

## Desarrollo

Requiere Node 22 o superior y pnpm 11.25. El repositorio fija la versión de pnpm
en `packageManager`.

```bash
pnpm install
pnpm start
```

`pnpm start` compila el bundle y sirve `public/` en
<http://localhost:20396/>. `localhost` es un contexto seguro, así que WebAuthn
funciona sin HTTPS.

Otros comandos:

```bash
pnpm test    # pruebas de la tienda local con node:test
pnpm build   # genera public/app.js
```

El flujo WebAuthn completo (registro, cierre de sesión y acceso) se prueba en un
navegador real. La suite automática cubre la tienda que simula el servidor; no
incluye un autenticador virtual en CI.

## Estructura

```text
public/            HTML, CSS, fuentes, favicon y el bundle generado
src/almacen.js     servidor simulado sobre localStorage
src/textos.js      textos de la interfaz en español e inglés
src/app.js         WebAuthn, sesión y UI
scripts/build.mjs  bundle con esbuild
scripts/servir.mjs preview estático local
test/              pruebas de la tienda
.github/workflows  publicación en GitHub Pages
```

## Publicación

El workflow `.github/workflows/pages.yml` ejecuta las pruebas, compila y publica
`public/` en GitHub Pages en cada push a `main`. En el repositorio, la fuente de
Pages debe estar en **Settings → Pages → Source: GitHub Actions**.

La demo pública queda en
<https://johanruizb.github.io/passkey-demo/>. El RP ID es
`johanruizb.github.io`, así que las passkeys creadas allí quedan atadas a ese
dominio.

## Licencia y créditos

Código bajo licencia MIT. Consulta `LICENSE`.

Las fuentes se autoalojan en `public/fonts/`:

- Atkinson Hyperlegible, del Braille Institute, bajo SIL Open Font License.
- IBM Plex Mono, de IBM, bajo SIL Open Font License.

Las licencias completas están junto a los archivos de fuente. SimpleWebAuthn
también es MIT.

La demo no está afiliada a SimpleWebAuthn, Apple, Google, Microsoft ni a ningún
proveedor de passkeys.
