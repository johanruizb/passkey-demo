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
import { CLAVE_IDIOMA, resolverIdioma } from './idioma.js';
import { TEXTOS } from './textos.js';

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

function idiomaInicial() {
  let guardado = null;
  try {
    guardado = localStorage.getItem(CLAVE_IDIOMA);
  } catch {
    // Sin localStorage se usa el idioma del navegador.
  }
  return resolverIdioma(guardado, navigator.language);
}

let idioma = idiomaInicial();
let mensajeActual = null;
let avisoActual = null;

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
const grupoIdioma = $('.idioma');

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

function t(clave, ...args) {
  const entrada = TEXTOS[idioma]?.[clave] ?? TEXTOS.es[clave] ?? clave;
  return typeof entrada === 'function' ? entrada(...args) : entrada;
}

function pintarMensaje() {
  if (!mensajeActual) return;
  mensaje.textContent = t(mensajeActual.clave, ...mensajeActual.args);
  mensaje.dataset.error = String(mensajeActual.error);
}

function mostrarMensaje(clave, { args = [], error = false } = {}) {
  mensajeActual = { clave, args, error };
  pintarMensaje();
}

function pintarAviso() {
  if (!avisoActual) return;
  aviso.textContent = t(avisoActual);
}

function aplicarIdioma(nuevo, persistir = false) {
  idioma = nuevo === 'en' ? 'en' : 'es';
  if (persistir) {
    try {
      localStorage.setItem(CLAVE_IDIOMA, idioma);
    } catch {
      // La preferencia vive en memoria aunque localStorage esté bloqueado.
    }
  }

  document.documentElement.lang = idioma;

  for (const elemento of document.querySelectorAll('[data-i18n]')) {
    elemento.textContent = t(elemento.dataset.i18n);
  }
  for (const elemento of document.querySelectorAll('[data-i18n-placeholder]')) {
    elemento.placeholder = t(elemento.dataset.i18nPlaceholder);
  }
  for (const elemento of document.querySelectorAll('[data-i18n-aria-label]')) {
    elemento.setAttribute('aria-label', t(elemento.dataset.i18nAriaLabel));
  }
  for (const elemento of document.querySelectorAll('[data-i18n-content]')) {
    elemento.setAttribute('content', t(elemento.dataset.i18nContent));
  }
  for (const boton of document.querySelectorAll('[data-idioma]')) {
    boton.setAttribute('aria-pressed', String(boton.dataset.idioma === idioma));
  }

  render();
  pintarMensaje();
  pintarAviso();
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
    estadoEl.textContent = t('estadoNoDisponible');
    formulario.hidden = true;
    btnEntrar.disabled = true;
    return;
  }

  const usuario = usuarioSesion();
  const datos = almacen.leer();
  const totalCredenciales = datos.credenciales.length;
  const activo = Boolean(usuario);

  estadoEl.textContent = activo
    ? t('estadoSesionAbierta')
    : t('estadoSinSesion');
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
      ? t('sesionAbiertaComo', usuario.nombre)
      : nombre
        ? t('passkeyCreadaPara', nombre)
        : t('passkeyCreadaEnNavegador');
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

  btnRegistrar.textContent = ocupado
    ? t('esperando')
    : t('crearPasskey');
  btnSalir.textContent = ocupado ? t('esperando') : t('cerrarSesion');
  btnEntrar.textContent = ocupado
    ? t('esperando')
    : t('entrarConPasskey');

  pendienteSalir.textContent = t('pendienteSalir');
  pendienteEntrar.textContent = t('pendienteEntrar');

  const salida = {
    mode: t('servidorModo'),
    origin: location.origin,
    rpID: RP_ID,
    users: datos.usuarios.length,
    activeSessions: activo ? 1 : 0,
    serverCredentials: totalCredenciales,
    credentials: datos.credenciales.map((credencial) => {
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
        user: dueno?.nombre ?? '—',
        publicKeyBytes: bytesClave,
        counter: credencial.counter,
        device: credencial.deviceType,
        backedUp: credencial.backedUp,
        transports: credencial.transports ?? [],
      };
    }),
  };

  datosJson.textContent = JSON.stringify(salida, null, 2);
}

function claveDeError(error, fase) {
  if (
    error?.name === 'NotAllowedError' ||
    error?.name === 'AbortError'
  ) {
    return fase === 'crear' ? 'errorCanceladoCrear' : 'errorCanceladoEntrar';
  }
  if (error?.name === 'InvalidStateError') {
    return 'errorYaExiste';
  }
  if (error?.name === 'SecurityError') {
    return 'errorSeguridad';
  }
  if (
    error?.name === 'NotSupportedError' ||
    error?.name === 'ConstraintError'
  ) {
    return 'errorNoSoportado';
  }
  console.error(error);
  return 'errorGenerico';
}

async function registrar(nombre) {
  if (!soportado || ocupado) return;
  ocupar(true);
  mostrarMensaje('esperandoAutenticador');
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
      mostrarMensaje('errorVerificacion', { error: true });
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
    mostrarMensaje('passkeyCreadaSesion', {
      args: [ceremoniaRegistro.nombre],
    });
  } catch (error) {
    mostrarMensaje(claveDeError(error, 'crear'), { error: true });
  } finally {
    ceremoniaRegistro = null;
    ocupar(false);
  }
}

async function entrar() {
  if (!soportado || ocupado) return;
  ocupar(true);
  mostrarMensaje('esperandoAutenticador');
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
      mostrarMensaje('passkeyNoRegistrada', { error: true });
      return;
    }

    const usuario = almacen.usuario(guardada.usuarioId);
    if (!usuario) {
      mostrarMensaje('cuentaNoExiste', { error: true });
      return;
    }

    if (
      respuesta.response.userHandle &&
      respuesta.response.userHandle !== usuario.id
    ) {
      mostrarMensaje('passkeyNoCoincide', { error: true });
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
      mostrarMensaje('firmaNoCoincide', { error: true });
      return;
    }

    almacen.actualizarCredencial(guardada.id, {
      counter: verificacion.authenticationInfo.newCounter,
      ultimoUso: new Date().toISOString(),
    });
    guardarSesion(usuario.id);
    mostrarMensaje('entrasteComo', { args: [usuario.nombre] });
  } catch (error) {
    mostrarMensaje(claveDeError(error, 'entrar'), { error: true });
  } finally {
    ceremoniaAcceso = null;
    ocupar(false);
  }
}

function salir() {
  guardarSesion(null);
  mostrarMensaje('sesionCerrada');
  render();
}

function borrar() {
  if (!almacen) return;
  const usuario = usuarioSesion();
  if (!usuario) return;
  const seguro = window.confirm(t('confirmarBorrado'));
  if (!seguro) return;
  almacen.limpiar();
  guardarSesion(null);
  mostrarMensaje('datosBorrados');
  render();
}

function claveAviso() {
  if (!almacen) {
    return 'avisoAlmacenamiento';
  }
  if (esIP) {
    return 'avisoIP';
  }
  if (!window.isSecureContext) {
    return 'avisoContexto';
  }
  return 'avisoSinWebauthn';
}

function iniciar() {
  aplicarIdioma(idioma);
  grupoIdioma.hidden = false;

  if (!soportado) {
    avisoActual = claveAviso();
    aviso.hidden = false;
    pintarAviso();
    mostrarMensaje('necesitaWebauthn', { error: true });
  }

  formulario.addEventListener('submit', (event) => {
    event.preventDefault();
    const nombre = normalizarNombre(nombreInput.value);
    if (nombre.length < 2) {
      mostrarMensaje('nombreCorto', { error: true });
      nombreInput.focus();
      return;
    }
    void registrar(nombre);
  });
  btnSalir.addEventListener('click', salir);
  btnEntrar.addEventListener('click', entrar);
  btnBorrar.addEventListener('click', borrar);

  for (const boton of document.querySelectorAll('[data-idioma]')) {
    boton.addEventListener('click', () =>
      aplicarIdioma(boton.dataset.idioma, true),
    );
  }

  const usuario = usuarioSesion();
  if (soportado) {
    if (usuario) {
      mostrarMensaje('sesionAbiertaCierra', { args: [usuario.nombre] });
    } else if (almacen.estado().credenciales > 0) {
      mostrarMensaje('passkeySigueAqui');
    } else {
      mostrarMensaje('crearParaEmpezar');
    }
  }
}

iniciar();
