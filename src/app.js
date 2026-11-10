/**
 * Demo pública de passkeys. WebAuthn real; el «servidor» vive en localStorage
 * y la sesión en sessionStorage. No hay red ni backend.
 */
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import {
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
import { crearAlmacen, normalizarNombre } from './almacen.js';

const CLAVE_SESION = 'passkey-demo:sesion';
const NOMBRE_RP = 'Passkey Demo';
const RP_ID = location.hostname;

const esIP =
  /^\d{1,3}(\.\d{1,3}){3}$/.test(location.hostname) ||
  location.hostname.includes(':');

let almacen = null;
try {
  almacen = crearAlmacen();
} catch {
  almacen = null;
}

const soportado = Boolean(
  almacen &&
    window.isSecureContext &&
    typeof PublicKeyCredential !== 'undefined' &&
    navigator.credentials &&
    !esIP,
);

let sesionId = null;
try {
  sesionId = sessionStorage.getItem(CLAVE_SESION);
} catch {
  sesionId = null;
}

let ocupado = false;
let ceremoniaRegistro = null;
let ceremoniaAcceso = null;

const $ = (selector) => document.querySelector(selector);
const panelDispositivo = $('#dispositivo');
const estadoEl = $('#estado');
const pasoCrear = $('#paso-crear');
const pasoSalir = $('#paso-salir');
const pasoEntrar = $('#paso-entrar');
const formulario = $('#form-registro');
const nombreInput = $('#nombre');
const btnRegistrar = $('#btn-registrar');
const btnSalir = $('#btn-salir');
const btnEntrar = $('#btn-entrar');
const hecho = $('#hecho-registro');
const pendienteSalir = $('#pendiente-salir');
const pendienteEntrar = $('#pendiente-entrar');
const mensaje = $('#mensaje');
const datosJson = $('#datos-json');
const btnBorrar = $('#btn-borrar');
const aviso = $('#aviso-navegador');

function aBase64url(bytes) {
  let binario = '';
  for (const byte of bytes) binario += String.fromCharCode(byte);
  return btoa(binario)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function deBase64url(texto) {
  const limpio = String(texto)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const relleno = limpio + '='.repeat((4 - (limpio.length % 4)) % 4);
  const binario = atob(relleno);
  return Uint8Array.from(binario, (caracter) => caracter.charCodeAt(0));
}

function idNuevo() {
  return aBase64url(crypto.getRandomValues(new Uint8Array(16)));
}

function guardarSesion(id) {
  sesionId = id;
  try {
    if (id) sessionStorage.setItem(CLAVE_SESION, id);
    else sessionStorage.removeItem(CLAVE_SESION);
  } catch {
    // La sesión vive en memoria aunque sessionStorage esté bloqueado.
  }
}

function usuarioSesion() {
  if (!almacen || !sesionId) return null;
  const usuario = almacen.usuario(sesionId);
  if (!usuario) {
    guardarSesion(null);
    return null;
  }
  return usuario;
}

function mostrarMensaje(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.dataset.error = String(esError);
}

function ocupar(valor) {
  ocupado = valor;
  panelDispositivo.setAttribute('aria-busy', String(valor));
  render();
}

function nombreDeCredenciales(datos) {
  const nombres = [
    ...new Set(
      datos.credenciales
        .map(
          (credencial) =>
            datos.usuarios.find((u) => u.id === credencial.usuarioId)
              ?.nombre,
        )
        .filter(Boolean),
    ),
  ];
  return nombres.length === 1 ? nombres[0] : '';
}

function render() {
  if (!almacen) {
    estadoEl.textContent = 'No disponible';
    formulario.hidden = true;
    btnEntrar.disabled = true;
    return;
  }

  const usuario = usuarioSesion();
  const datos = almacen.leer();
  const totalCredenciales = datos.credenciales.length;
  const activo = Boolean(usuario);

  estadoEl.textContent = activo ? 'Sesión abierta' : 'Sin sesión';
  estadoEl.dataset.activa = String(activo);

  pasoCrear.dataset.estado = activo || totalCredenciales > 0 ? 'hecho' : 'activo';
  pasoSalir.dataset.estado = activo ? 'activo' : 'pendiente';
  pasoEntrar.dataset.estado = activo ? 'hecho' : 'activo';

  const formularioVisible = !activo && totalCredenciales === 0;
  formulario.hidden = !formularioVisible;
  hecho.hidden = formularioVisible;
  if (!formularioVisible) {
    const nombre = nombreDeCredenciales(datos);
    hecho.textContent = activo
      ? `Sesión abierta como ${usuario.nombre}.`
      : nombre
        ? `Passkey creada para ${nombre}.`
        : 'Passkey creada en este navegador.';
  }

  nombreInput.disabled = ocupado || !soportado;
  btnRegistrar.disabled = ocupado || !soportado;
  btnSalir.hidden = !activo;
  btnSalir.disabled = ocupado;
  pendienteSalir.hidden = activo;
  btnEntrar.hidden = activo;
  btnEntrar.disabled = ocupado || !soportado;
  pendienteEntrar.hidden = !activo;
  btnBorrar.hidden = !activo;
  btnBorrar.disabled = ocupado;

  btnRegistrar.textContent = ocupado ? 'Esperando…' : 'Crear passkey';
  btnSalir.textContent = ocupado ? 'Esperando…' : 'Cerrar sesión';
  btnEntrar.textContent = ocupado ? 'Esperando…' : 'Entrar con passkey';

  pendienteSalir.textContent = 'Disponible cuando haya una sesión.';
  pendienteEntrar.textContent = 'Ya estás dentro.';

  const salida = {
    modo: 'servidor simulado',
    origen: location.origin,
    rpID: RP_ID,
    usuarios: datos.usuarios.length,
    sesionesActivas: activo ? 1 : 0,
    credencialesEnServidor: totalCredenciales,
    credenciales: datos.credenciales.map((credencial) => {
      const dueno = datos.usuarios.find(
        (u) => u.id === credencial.usuarioId,
      );
      let bytesClave = 0;
      try {
        bytesClave = deBase64url(credencial.publicKey).length;
      } catch {
        bytesClave = 0;
      }
      return {
        id: `${String(credencial.id).slice(0, 16)}…`,
        usuario: dueno?.nombre ?? '—',
        clavePublicaBytes: bytesClave,
        contador: credencial.counter,
        dispositivo: credencial.deviceType,
        respaldo: credencial.backedUp,
        transportes: credencial.transports ?? [],
      };
    }),
  };

  datosJson.textContent = JSON.stringify(salida, null, 2);
}

function mensajeDeError(error, fase) {
  if (
    error?.name === 'NotAllowedError' ||
    error?.name === 'AbortError'
  ) {
    return fase === 'crear'
      ? 'No se creó la passkey. Puedes intentarlo otra vez.'
      : 'No se completó el acceso. Puedes intentarlo otra vez.';
  }
  if (error?.name === 'InvalidStateError') {
    return 'Ya hay una passkey para este sitio en este dispositivo. Prueba a entrar con ella.';
  }
  if (error?.name === 'SecurityError') {
    return 'El navegador bloqueó la operación. Comprueba que la página está en HTTPS o en localhost.';
  }
  if (
    error?.name === 'NotSupportedError' ||
    error?.name === 'ConstraintError'
  ) {
    return 'Este autenticador no admite passkeys. Prueba con Face ID, Touch ID, Windows Hello o una llave de seguridad.';
  }
  console.error(error);
  return 'No se pudo completar la operación. Inténtalo de nuevo.';
}

async function registrar(nombre) {
  if (!soportado || ocupado) return;
  ocupar(true);
  mostrarMensaje('El navegador está esperando tu Face ID, huella o PIN.');
  try {
    const existente = almacen.usuarioPorNombre(nombre);
    const usuarioId = existente?.id ?? idNuevo();
    const excluir = almacen.credencialesDe(usuarioId).map((credencial) => ({
      id: credencial.id,
      transports: credencial.transports,
    }));

    const opciones = await generateRegistrationOptions({
      rpName: NOMBRE_RP,
      rpID: RP_ID,
      userID: deBase64url(usuarioId),
      userName: nombre,
      userDisplayName: nombre,
      excludeCredentials: excluir,
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
      },
      attestationType: 'none',
      timeout: 60_000,
    });

    ceremoniaRegistro = {
      challenge: opciones.challenge,
      usuarioId,
      nombre,
      nuevo: !existente,
    };

    const respuesta = await startRegistration({ optionsJSON: opciones });
    const verificacion = await verifyRegistrationResponse({
      response: respuesta,
      expectedChallenge: ceremoniaRegistro.challenge,
      expectedOrigin: location.origin,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    });

    if (!verificacion.verified || !verificacion.registrationInfo) {
      mostrarMensaje('El navegador no pudo verificar la passkey.', true);
      return;
    }

    const info = verificacion.registrationInfo;
    if (ceremoniaRegistro.nuevo) {
      almacen.crearUsuario({
        id: ceremoniaRegistro.usuarioId,
        nombre: ceremoniaRegistro.nombre,
      });
    }
    almacen.agregarCredencial({
      id: info.credential.id,
      usuarioId: ceremoniaRegistro.usuarioId,
      publicKey: aBase64url(info.credential.publicKey),
      counter: info.credential.counter,
      transports: info.credential.transports ?? [],
      deviceType: info.credentialDeviceType,
      backedUp: info.credentialBackedUp,
      creadoEn: new Date().toISOString(),
    });

    guardarSesion(ceremoniaRegistro.usuarioId);
    mostrarMensaje(
      `Passkey creada. Sesión abierta como ${ceremoniaRegistro.nombre}.`,
    );
  } catch (error) {
    mostrarMensaje(mensajeDeError(error, 'crear'), true);
  } finally {
    ceremoniaRegistro = null;
    ocupar(false);
  }
}

async function entrar() {
  if (!soportado || ocupado) return;
  ocupar(true);
  mostrarMensaje('El navegador está esperando tu Face ID, huella o PIN.');
  try {
    const opciones = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: 'required',
      timeout: 60_000,
    });
    ceremoniaAcceso = { challenge: opciones.challenge };

    const respuesta = await startAuthentication({ optionsJSON: opciones });
    const guardada = almacen.credencial(respuesta.id);
    if (!guardada) {
      mostrarMensaje(
        'Esta passkey no está registrada en este navegador. Crea una nueva en la demo.',
        true,
      );
      return;
    }

    const usuario = almacen.usuario(guardada.usuarioId);
    if (!usuario) {
      mostrarMensaje(
        'La cuenta de esta passkey ya no existe en esta demo. Crea una nueva.',
        true,
      );
      return;
    }

    if (
      respuesta.response.userHandle &&
      respuesta.response.userHandle !== usuario.id
    ) {
      mostrarMensaje(
        'La passkey no corresponde a la cuenta guardada. Crea una nueva en la demo.',
        true,
      );
      return;
    }

    const verificacion = await verifyAuthenticationResponse({
      response: respuesta,
      expectedChallenge: ceremoniaAcceso.challenge,
      expectedOrigin: location.origin,
      expectedRPID: RP_ID,
      credential: {
        id: guardada.id,
        publicKey: deBase64url(guardada.publicKey),
        counter: guardada.counter,
        transports: guardada.transports ?? [],
      },
      requireUserVerification: true,
    });

    if (!verificacion.verified) {
      mostrarMensaje('La firma no coincide. Inténtalo de nuevo.', true);
      return;
    }

    almacen.actualizarCredencial(guardada.id, {
      counter: verificacion.authenticationInfo.newCounter,
      ultimoUso: new Date().toISOString(),
    });
    guardarSesion(usuario.id);
    mostrarMensaje(`Entraste con la passkey de ${usuario.nombre}.`);
  } catch (error) {
    mostrarMensaje(mensajeDeError(error, 'entrar'), true);
  } finally {
    ceremoniaAcceso = null;
    ocupar(false);
  }
}

function salir() {
  guardarSesion(null);
  mostrarMensaje('Sesión cerrada. La passkey sigue en este dispositivo.');
  render();
}

function borrar() {
  if (!almacen) return;
  const usuario = usuarioSesion();
  if (!usuario) return;
  const seguro = window.confirm(
    'Se borrarán los datos de esta demo en este navegador. La passkey seguirá en tu dispositivo. ¿Continuar?',
  );
  if (!seguro) return;
  almacen.limpiar();
  guardarSesion(null);
  mostrarMensaje(
    'Datos de la demo borrados. La passkey sigue en tu dispositivo; bórrala desde la configuración de passkeys del sistema si quieres eliminarla.',
  );
  render();
}

function avisoDeEntorno() {
  if (!almacen) {
    return 'Este navegador bloquea el almacenamiento local. La demo necesita guardar la credencial para poder verificarla.';
  }
  if (esIP) {
    return 'Abre la demo en http://localhost:20396. WebAuthn no acepta direcciones IP.';
  }
  if (!window.isSecureContext) {
    return 'Abre la demo en HTTPS o en localhost. WebAuthn no funciona en conexiones no seguras.';
  }
  return 'Este navegador no ofrece WebAuthn. Prueba con Chrome, Edge, Safari o Firefox actualizado.';
}

function iniciar() {
  if (!soportado) {
    aviso.hidden = false;
    aviso.textContent = avisoDeEntorno();
    mostrarMensaje(
      'Esta demo necesita WebAuthn y un contexto seguro. Abre la página en HTTPS o en localhost con un navegador actual.',
      true,
    );
  }
  render();

  formulario.addEventListener('submit', (event) => {
    event.preventDefault();
    const nombre = normalizarNombre(nombreInput.value);
    if (nombre.length < 2) {
      mostrarMensaje('Escribe un nombre de al menos 2 letras.', true);
      nombreInput.focus();
      return;
    }
    void registrar(nombre);
  });
  btnSalir.addEventListener('click', salir);
  btnEntrar.addEventListener('click', entrar);
  btnBorrar.addEventListener('click', borrar);

  const usuario = usuarioSesion();
  if (soportado) {
    if (usuario) {
      mostrarMensaje(
        `Sesión abierta como ${usuario.nombre}. Cierra sesión para probar el acceso con la passkey.`,
      );
    } else if (almacen.estado().credenciales > 0) {
      mostrarMensaje(
        'La passkey sigue en este dispositivo. Entra con ella cuando quieras.',
      );
    } else {
      mostrarMensaje(
        'Crea una passkey para empezar. Si ya tienes una en este navegador, prueba a entrar.',
      );
    }
  }
}

iniciar();
