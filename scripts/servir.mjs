import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(fileURLToPath(new URL('../public', import.meta.url)));
const PUERTO = Number(process.env.PORT ?? 20396);
const HOST = process.env.HOST ?? '127.0.0.1';

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const servidor = createServer(async (peticion, respuesta) => {
  const host = peticion.headers.host ?? '';

  if (host.startsWith('127.0.0.1')) {
    respuesta.writeHead(302, {
      location: `http://localhost:${PUERTO}${peticion.url ?? '/'}`,
    });
    respuesta.end();
    return;
  }

  const url = new URL(peticion.url ?? '/', `http://${host}`);
  let ruta = decodeURIComponent(url.pathname);
  if (ruta.endsWith('/')) ruta += 'index.html';

  const archivo = resolve(join(RAIZ, normalize(ruta)));
  if (!archivo.startsWith(`${RAIZ}/`)) {
    respuesta.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
    respuesta.end('Prohibido');
    return;
  }

  try {
    const contenido = await readFile(archivo);
    respuesta.writeHead(200, {
      'content-type': TIPOS[extname(archivo)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    });
    respuesta.end(contenido);
  } catch {
    respuesta.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    respuesta.end('No encontrado');
  }
});

servidor.listen(PUERTO, HOST, () => {
  console.log(`Passkey Demo en http://localhost:${PUERTO}/`);
});
