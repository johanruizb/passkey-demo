/**
 * Textos de la interfaz en español e inglés. Las claves son planas y estables;
 * las que interpolan el nombre del usuario son funciones.
 */
export const TEXTOS = {
  es: {
    titulo: 'Passkey Demo · Prueba una passkey en tu navegador',
    descripcion:
      'Un banco de pruebas público para passkeys. Crea una, cierra sesión y vuelve a entrar sin contraseña. WebAuthn real, verificado en tu navegador.',
    saltarContenido: 'Saltar al contenido',
    cabeceraNota: 'Un banco de pruebas público',
    codigoGithub: 'Código en GitHub',
    idiomaEtiqueta: 'Idioma',
    tituloPrincipal: 'Prueba una passkey en este navegador.',
    entradaTexto:
      'Crea una, cierra la sesión y vuelve a entrar sin correo ni contraseña. La clave privada se queda en tu dispositivo; aquí solo se guarda la pública.',
    entradaAviso:
      'El servidor de esta demo está simulado en tu navegador. No se envía nada a ninguna parte.',
    dispositivoEtiqueta: 'Tu dispositivo',
    estadoSinSesion: 'Sin sesión',
    estadoSesionAbierta: 'Sesión abierta',
    estadoNoDisponible: 'No disponible',
    dispositivoTitulo: 'La llave que no se copia',
    dispositivoIntro:
      'El autenticador guarda la clave privada. El servidor solo recibe la pública y una firma.',
    pasoCrearTitulo: 'Crea tu passkey',
    pasoCrearTexto:
      'Elige un nombre. El navegador pedirá Face ID, huella o el PIN del equipo.',
    nombreEtiqueta: 'Tu nombre',
    nombrePlaceholder: 'Tu nombre',
    crearPasskey: 'Crear passkey',
    esperando: 'Esperando…',
    pasoSalirTitulo: 'Cierra la sesión',
    pasoSalirTexto:
      'La passkey sigue en tu dispositivo. La sesión es solo un estado de esta pestaña.',
    cerrarSesion: 'Cerrar sesión',
    pendienteSalir: 'Disponible cuando haya una sesión.',
    pasoEntrarTitulo: 'Vuelve a entrar',
    pasoEntrarTexto:
      'Un toque y Face ID. Sin escribir tu correo ni una contraseña.',
    entrarConPasskey: 'Entrar con passkey',
    pendienteEntrar: 'Ya estás dentro.',
    servidorEtiqueta: 'El servidor',
    servidorModoSimulado: 'simulado',
    servidorModo: 'servidor simulado',
    servidorTitulo: 'Lo que guarda el servidor',
    servidorIntro:
      'Ni contraseñas ni clave privada. Solo la clave pública, el identificador y el contador.',
    datosAriaLabel: 'Datos del servidor simulado',
    cargando: 'Cargando…',
    servidorNota:
      'En producción, esta información vive en un servidor real y la verificación de la firma ocurre allí. Aquí se hace en tu navegador para que la demo funcione sin backend.',
    borrarDatos: 'Borrar los datos de esta demo',
    explicacionTitulo: 'Qué acabas de ver',
    explicacionPrivadaTitulo: 'La privada no viaja.',
    explicacionPrivadaTexto:
      'Se queda en el autenticador del sistema, protegida por Face ID, la huella o el PIN. Ni esta página ni ningún servidor la reciben.',
    explicacionPublicaTitulo: 'La pública sí se puede guardar.',
    explicacionPublicaTexto:
      'No sirve para suplantar a nadie. El servidor la usa para comprobar que la firma del desafío salió de tu llave privada.',
    explicacionDesafioTitulo: 'El desafío es único.',
    explicacionDesafioTexto:
      'Cada intento usa un valor nuevo. Una firma capturada no se puede reutilizar en otro acceso. Si pierdes el dispositivo, necesitas un método de recuperación.',
    explicacionNota:
      'En iPhone, la passkey puede vivir en iCloud Keychain y usarse en Safari o en la app instalada. Este laboratorio guarda el registro en este navegador: para probar otro dispositivo, crea una passkey allí.',
    pieHechoCon: 'Hecho con',
    pieSinCuentas:
      'Sin cuentas, sin anuncios, sin datos que salgan de tu navegador.',
    pieLicencia: 'Código y licencia MIT',
    sesionAbiertaComo: (nombre) => `Sesión abierta como ${nombre}.`,
    passkeyCreadaPara: (nombre) => `Passkey creada para ${nombre}.`,
    passkeyCreadaEnNavegador: 'Passkey creada en este navegador.',
    esperandoAutenticador:
      'El navegador está esperando tu Face ID, huella o PIN.',
    errorCanceladoCrear:
      'No se creó la passkey. Puedes intentarlo otra vez.',
    errorCanceladoEntrar:
      'No se completó el acceso. Puedes intentarlo otra vez.',
    errorYaExiste:
      'Ya hay una passkey para este sitio en este dispositivo. Prueba a entrar con ella.',
    errorSeguridad:
      'El navegador bloqueó la operación. Comprueba que la página está en HTTPS o en localhost.',
    errorNoSoportado:
      'Este autenticador no admite passkeys. Prueba con Face ID, Touch ID, Windows Hello o una llave de seguridad.',
    errorGenerico: 'No se pudo completar la operación. Inténtalo de nuevo.',
    errorVerificacion: 'El navegador no pudo verificar la passkey.',
    passkeyCreadaSesion: (nombre) =>
      `Passkey creada. Sesión abierta como ${nombre}.`,
    passkeyNoRegistrada:
      'Esta passkey no está registrada en este navegador. Crea una nueva en la demo.',
    cuentaNoExiste:
      'La cuenta de esta passkey ya no existe en esta demo. Crea una nueva.',
    passkeyNoCoincide:
      'La passkey no corresponde a la cuenta guardada. Crea una nueva en la demo.',
    firmaNoCoincide: 'La firma no coincide. Inténtalo de nuevo.',
    entrasteComo: (nombre) => `Entraste con la passkey de ${nombre}.`,
    sesionCerrada: 'Sesión cerrada. La passkey sigue en este dispositivo.',
    confirmarBorrado:
      'Se borrarán los datos de esta demo en este navegador. La passkey seguirá en tu dispositivo. ¿Continuar?',
    datosBorrados:
      'Datos de la demo borrados. La passkey sigue en tu dispositivo; bórrala desde la configuración de passkeys del sistema si quieres eliminarla.',
    avisoAlmacenamiento:
      'Este navegador bloquea el almacenamiento local. La demo necesita guardar la credencial para poder verificarla.',
    avisoIP:
      'Abre la demo en http://localhost:20396. WebAuthn no acepta direcciones IP.',
    avisoContexto:
      'Abre la demo en HTTPS o en localhost. WebAuthn no funciona en conexiones no seguras.',
    avisoSinWebauthn:
      'Este navegador no ofrece WebAuthn. Prueba con Chrome, Edge, Safari o Firefox actualizado.',
    necesitaWebauthn:
      'Esta demo necesita WebAuthn y un contexto seguro. Abre la página en HTTPS o en localhost con un navegador actual.',
    nombreCorto: 'Escribe un nombre de al menos 2 letras.',
    sesionAbiertaCierra: (nombre) =>
      `Sesión abierta como ${nombre}. Cierra sesión para probar el acceso con la passkey.`,
    passkeySigueAqui:
      'La passkey sigue en este dispositivo. Entra con ella cuando quieras.',
    crearParaEmpezar:
      'Crea una passkey para empezar. Si ya tienes una en este navegador, prueba a entrar.',
  },
  en: {
    titulo: 'Passkey Demo · Try a passkey in your browser',
    descripcion:
      'A public passkey playground. Create one, sign out, and sign back in without a password. Real WebAuthn, verified in your browser.',
    saltarContenido: 'Skip to content',
    cabeceraNota: 'A public playground',
    codigoGithub: 'Code on GitHub',
    idiomaEtiqueta: 'Language',
    tituloPrincipal: 'Try a passkey in this browser.',
    entradaTexto:
      'Create one, sign out, and sign back in without an email or password. The private key stays on your device; only the public key is kept here.',
    entradaAviso:
      "This demo's server is simulated in your browser. Nothing is sent anywhere.",
    dispositivoEtiqueta: 'Your device',
    estadoSinSesion: 'Signed out',
    estadoSesionAbierta: 'Signed in',
    estadoNoDisponible: 'Unavailable',
    dispositivoTitulo: "The key that can't be copied",
    dispositivoIntro:
      'The authenticator holds the private key. The server only receives the public key and a signature.',
    pasoCrearTitulo: 'Create your passkey',
    pasoCrearTexto:
      'Pick a name. The browser will ask for Face ID, your fingerprint, or your device PIN.',
    nombreEtiqueta: 'Your name',
    nombrePlaceholder: 'Your name',
    crearPasskey: 'Create passkey',
    esperando: 'Waiting…',
    pasoSalirTitulo: 'Sign out',
    pasoSalirTexto:
      'The passkey stays on your device. The session is only a state of this tab.',
    cerrarSesion: 'Sign out',
    pendienteSalir: "Available once you're signed in.",
    pasoEntrarTitulo: 'Sign back in',
    pasoEntrarTexto: 'One touch and Face ID. No email or password to type.',
    entrarConPasskey: 'Sign in with passkey',
    pendienteEntrar: "You're already signed in.",
    servidorEtiqueta: 'The server',
    servidorModoSimulado: 'simulated',
    servidorModo: 'simulated server',
    servidorTitulo: 'What the server stores',
    servidorIntro:
      'No passwords and no private key. Only the public key, the credential ID, and the counter.',
    datosAriaLabel: 'Simulated server data',
    cargando: 'Loading…',
    servidorNota:
      'In production, this information lives on a real server and signature verification happens there. Here it happens in your browser so the demo works without a backend.',
    borrarDatos: "Delete this demo's data",
    explicacionTitulo: 'What you just saw',
    explicacionPrivadaTitulo: 'The private key never travels.',
    explicacionPrivadaTexto:
      'It stays in your system authenticator, protected by Face ID, your fingerprint, or your PIN. Neither this page nor any server receives it.',
    explicacionPublicaTitulo: 'The public key can be stored.',
    explicacionPublicaTexto:
      "It can't be used to impersonate anyone. The server uses it to check that the challenge signature came from your private key.",
    explicacionDesafioTitulo: 'The challenge is unique.',
    explicacionDesafioTexto:
      "Every attempt uses a new value. A captured signature can't be reused for another sign-in. If you lose your device, you need a recovery method.",
    explicacionNota:
      'On iPhone, the passkey can live in iCloud Keychain and be used in Safari or the installed app. This lab stores the record in this browser: to test another device, create a passkey there.',
    pieHechoCon: 'Made with',
    pieSinCuentas: 'No accounts, no ads, no data leaving your browser.',
    pieLicencia: 'Code and MIT license',
    sesionAbiertaComo: (nombre) => `Signed in as ${nombre}.`,
    passkeyCreadaPara: (nombre) => `Passkey created for ${nombre}.`,
    passkeyCreadaEnNavegador: 'Passkey created in this browser.',
    esperandoAutenticador:
      'The browser is waiting for your Face ID, fingerprint, or PIN.',
    errorCanceladoCrear: "The passkey wasn't created. You can try again.",
    errorCanceladoEntrar: "Sign-in wasn't completed. You can try again.",
    errorYaExiste:
      "There's already a passkey for this site on this device. Try signing in with it.",
    errorSeguridad:
      'The browser blocked the operation. Check that the page is on HTTPS or localhost.',
    errorNoSoportado:
      "This authenticator doesn't support passkeys. Try Face ID, Touch ID, Windows Hello, or a security key.",
    errorGenerico: "The operation couldn't be completed. Try again.",
    errorVerificacion: "The browser couldn't verify the passkey.",
    passkeyCreadaSesion: (nombre) =>
      `Passkey created. Signed in as ${nombre}.`,
    passkeyNoRegistrada:
      "This passkey isn't registered in this browser. Create a new one in the demo.",
    cuentaNoExiste:
      "This passkey's account no longer exists in this demo. Create a new one.",
    passkeyNoCoincide:
      "The passkey doesn't match the saved account. Create a new one in the demo.",
    firmaNoCoincide: "The signature doesn't match. Try again.",
    entrasteComo: (nombre) => `You signed in with ${nombre}'s passkey.`,
    sesionCerrada: 'Signed out. The passkey is still on this device.',
    confirmarBorrado:
      "This demo's data will be deleted from this browser. The passkey will stay on your device. Continue?",
    datosBorrados:
      "Demo data deleted. The passkey is still on your device; remove it from your system's passkey settings if you want to delete it.",
    avisoAlmacenamiento:
      'This browser blocks local storage. The demo needs to save the credential to verify it.',
    avisoIP:
      "Open the demo at http://localhost:20396. WebAuthn doesn't accept IP addresses.",
    avisoContexto:
      "Open the demo on HTTPS or localhost. WebAuthn doesn't work on insecure connections.",
    avisoSinWebauthn:
      "This browser doesn't offer WebAuthn. Try an up-to-date Chrome, Edge, Safari, or Firefox.",
    necesitaWebauthn:
      'This demo needs WebAuthn and a secure context. Open the page on HTTPS or localhost with a current browser.',
    nombreCorto: 'Enter a name with at least 2 letters.',
    sesionAbiertaCierra: (nombre) =>
      `Signed in as ${nombre}. Sign out to try signing in with the passkey.`,
    passkeySigueAqui:
      'The passkey is still on this device. Sign in with it whenever you like.',
    crearParaEmpezar:
      'Create a passkey to start. If you already have one in this browser, try signing in.',
  },
};
