/**
 * El «servidor» de la demo: un almacén local con usuarios y credenciales.
 * No hay red ni backend. La clave pública vive aquí; la privada nunca sale
 * del autenticador del sistema.
 */

const CLAVE = 'passkey-demo:v1';

const vacio = () => ({ usuarios: [], credenciales: [] });

export function normalizarNombre(nombre) {
  return String(nombre ?? '')
    .trim()
    .replace(/\s+/g, ' ');
}

function esValido(datos) {
  return (
    datos !== null &&
    typeof datos === 'object' &&
    Array.isArray(datos.usuarios) &&
    Array.isArray(datos.credenciales)
  );
}

export function crearAlmacen(storage = globalThis.localStorage) {
  if (!storage) throw new Error('Hace falta almacenamiento local.');

  function leer() {
    try {
      const crudo = storage.getItem(CLAVE);
      if (!crudo) return vacio();
      const datos = JSON.parse(crudo);
      return esValido(datos) ? datos : vacio();
    } catch {
      return vacio();
    }
  }

  function guardar(datos) {
    storage.setItem(CLAVE, JSON.stringify(datos));
  }

  function usuario(id) {
    return leer().usuarios.find((u) => u.id === id) ?? null;
  }

  function usuarioPorNombre(nombre) {
    const buscado = normalizarNombre(nombre).toLocaleLowerCase('es');
    return (
      leer().usuarios.find(
        (u) => u.nombre.toLocaleLowerCase('es') === buscado,
      ) ?? null
    );
  }

  function crearUsuario({ id, nombre }) {
    const datos = leer();
    const nuevo = {
      id,
      nombre: normalizarNombre(nombre),
      creadoEn: new Date().toISOString(),
    };
    datos.usuarios.push(nuevo);
    guardar(datos);
    return nuevo;
  }

  function credencialesDe(usuarioId) {
    return leer().credenciales.filter((c) => c.usuarioId === usuarioId);
  }

  function credencial(id) {
    return leer().credenciales.find((c) => c.id === id) ?? null;
  }

  function agregarCredencial(credencial) {
    const datos = leer();
    datos.credenciales.push(credencial);
    guardar(datos);
    return credencial;
  }

  function actualizarCredencial(id, cambios) {
    const datos = leer();
    const indice = datos.credenciales.findIndex((c) => c.id === id);
    if (indice === -1) return null;
    datos.credenciales[indice] = {
      ...datos.credenciales[indice],
      ...cambios,
    };
    guardar(datos);
    return datos.credenciales[indice];
  }

  function borrarUsuario(usuarioId) {
    const datos = leer();
    datos.usuarios = datos.usuarios.filter((u) => u.id !== usuarioId);
    datos.credenciales = datos.credenciales.filter(
      (c) => c.usuarioId !== usuarioId,
    );
    guardar(datos);
  }

  function limpiar() {
    storage.removeItem(CLAVE);
  }

  function estado(usuarioId = null) {
    const datos = leer();
    return {
      usuarios: datos.usuarios.length,
      credenciales: datos.credenciales.length,
      mias: usuarioId
        ? datos.credenciales.filter((c) => c.usuarioId === usuarioId)
        : [],
    };
  }

  return {
    leer,
    usuario,
    usuarioPorNombre,
    crearUsuario,
    credencialesDe,
    credencial,
    agregarCredencial,
    actualizarCredencial,
    borrarUsuario,
    limpiar,
    estado,
  };
}

export { CLAVE };
