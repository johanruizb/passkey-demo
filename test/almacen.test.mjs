import test from 'node:test';
import assert from 'node:assert/strict';
import { CLAVE, crearAlmacen, normalizarNombre } from '../src/almacen.js';

function memoria() {
  const datos = new Map();
  return {
    getItem: (clave) => (datos.has(clave) ? datos.get(clave) : null),
    setItem: (clave, valor) => datos.set(clave, String(valor)),
    removeItem: (clave) => datos.delete(clave),
  };
}

function conUsuario() {
  const storage = memoria();
  const almacen = crearAlmacen(storage);
  almacen.crearUsuario({ id: 'u1', nombre: 'Ana' });
  almacen.agregarCredencial({
    id: 'c1',
    usuarioId: 'u1',
    publicKey: 'AAAA',
    counter: 1,
    transports: ['internal'],
    deviceType: 'singleDevice',
    backedUp: false,
  });
  return { storage, almacen };
}

test('arranca vacío', () => {
  const almacen = crearAlmacen(memoria());
  assert.deepEqual(almacen.leer(), { usuarios: [], credenciales: [] });
  assert.equal(almacen.estado().usuarios, 0);
  assert.equal(almacen.estado().credenciales, 0);
});

test('crea usuario, guarda credencial y la recupera', () => {
  const { almacen } = conUsuario();
  assert.equal(almacen.usuario('u1').nombre, 'Ana');
  assert.equal(almacen.usuarioPorNombre(' ana ').id, 'u1');
  assert.equal(almacen.credencial('c1').usuarioId, 'u1');
  assert.equal(almacen.credencialesDe('u1').length, 1);
  assert.deepEqual(almacen.estado('u1').mias.map((c) => c.id), ['c1']);
  assert.deepEqual(almacen.estado('u2').mias, []);
});

test('actualiza el contador y el último uso', () => {
  const { almacen } = conUsuario();
  const actualizada = almacen.actualizarCredencial('c1', {
    counter: 2,
    ultimoUso: '2026-01-01T00:00:00.000Z',
  });
  assert.equal(actualizada.counter, 2);
  assert.equal(almacen.credencial('c1').counter, 2);
  assert.equal(almacen.actualizarCredencial('nope', { counter: 3 }), null);
});

test('borra solo el usuario indicado y sus credenciales', () => {
  const { almacen } = conUsuario();
  almacen.crearUsuario({ id: 'u2', nombre: 'Beto' });
  almacen.agregarCredencial({ id: 'c2', usuarioId: 'u2', publicKey: 'BBBB' });

  almacen.borrarUsuario('u1');

  assert.equal(almacen.usuario('u1'), null);
  assert.equal(almacen.credencial('c1'), null);
  assert.equal(almacen.usuario('u2').nombre, 'Beto');
  assert.equal(almacen.credencial('c2').id, 'c2');
});

test('limpia todos los datos', () => {
  const { storage, almacen } = conUsuario();
  almacen.limpiar();
  assert.equal(storage.getItem(CLAVE), null);
  assert.deepEqual(almacen.leer(), { usuarios: [], credenciales: [] });
});

test('tolera JSON corrupto y formas inesperadas', () => {
  const storage = memoria();
  const almacen = crearAlmacen(storage);

  storage.setItem(CLAVE, '{');
  assert.deepEqual(almacen.leer(), { usuarios: [], credenciales: [] });

  storage.setItem(CLAVE, '{"usuarios":null,"credenciales":[]}');
  assert.deepEqual(almacen.leer(), { usuarios: [], credenciales: [] });

  almacen.crearUsuario({ id: 'u1', nombre: 'Ana' });
  assert.equal(almacen.usuario('u1').nombre, 'Ana');
});

test('normaliza nombres y compara sin distinguir mayúsculas', () => {
  assert.equal(normalizarNombre('  Ana   María  '), 'Ana María');
  assert.equal(normalizarNombre(null), '');
  const { almacen } = conUsuario();
  assert.equal(almacen.usuarioPorNombre('ANA').id, 'u1');
  assert.equal(almacen.usuarioPorNombre('Beto'), null);
});

test('exige almacenamiento', () => {
  assert.throws(() => crearAlmacen(null), /almacenamiento local/i);
});
