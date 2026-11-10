import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TEXTOS } from '../src/textos.js';

const IDIOMAS = ['es', 'en'];
const NOMBRE = 'Ana';

function textoDe(entrada) {
  return typeof entrada === 'function' ? entrada(NOMBRE) : entrada;
}

test('es y en tienen exactamente las mismas claves', () => {
  assert.deepEqual(Object.keys(TEXTOS.en).sort(), Object.keys(TEXTOS.es).sort());
});

test('ningún texto está vacío', () => {
  for (const idioma of IDIOMAS) {
    for (const [clave, entrada] of Object.entries(TEXTOS[idioma])) {
      const texto = textoDe(entrada);
      assert.equal(typeof texto, 'string', `${idioma}.${clave} no es texto`);
      assert.ok(texto.trim().length > 0, `${idioma}.${clave} está vacío`);
    }
  }
});

test('index.html solo referencia claves que existen', () => {
  const html = readFileSync(
    new URL('../public/index.html', import.meta.url),
    'utf8',
  );
  const patron =
    /data-i18n(?:-placeholder|-aria-label|-content)?="([^"]+)"/g;
  for (const [, clave] of html.matchAll(patron)) {
    assert.ok(clave in TEXTOS.es, `falta la clave ${clave} en TEXTOS.es`);
  }
});

test('app.js solo referencia claves que existen', () => {
  const codigo = readFileSync(
    new URL('../src/app.js', import.meta.url),
    'utf8',
  );
  const patrones = [
    /\b(?:t|mostrarMensaje)\('([^']+)'/g,
    /'(error[A-Za-z]+)'/g,
  ];
  for (const patron of patrones) {
    for (const [, clave] of codigo.matchAll(patron)) {
      assert.ok(clave in TEXTOS.es, `falta la clave ${clave} en TEXTOS.es`);
    }
  }
});
