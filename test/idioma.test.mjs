import test from 'node:test';
import assert from 'node:assert/strict';
import { resolverIdioma } from '../src/idioma.js';

test('una elección guardada manda sobre el navegador', () => {
  assert.equal(resolverIdioma('en', 'es-ES'), 'en');
  assert.equal(resolverIdioma('es', 'en-US'), 'es');
});

test('sin elección válida se usa el idioma del navegador', () => {
  assert.equal(resolverIdioma(null, 'en-GB'), 'en');
  assert.equal(resolverIdioma('fr', 'en-US'), 'en');
  assert.equal(resolverIdioma(null, 'es-MX'), 'es');
});

test('sin datos del navegador cae en español', () => {
  assert.equal(resolverIdioma(null, undefined), 'es');
});
