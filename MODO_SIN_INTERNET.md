# Trabajo sin conexión para técnicos

## Alcance de esta versión

Se añade Trabajo sin conexión, una pantalla para descargar visitas y ejecutar las listas por etapas con actividades, observaciones, materiales y fotos sin señal. Los datos se guardan cifrados en IndexedDB del dispositivo con una clave local de al menos ocho caracteres. La clave local es diferente de la contraseña del servidor y no se envía a la plataforma.

Esta versión funciona con cuentas técnicas reales. El administrador conserva su plataforma completa en línea; la vista simulada de técnico no sustituye una cuenta técnica para preparar la descarga. No se guardan contraseñas de equipos, facturas, documentos de Drive ni sesiones de Google. Las fotografías anteriores que ya estaban en el servidor no se descargan; las fotos nuevas sí pueden visualizarse localmente hasta enviarse.

## Actualizar

Sube el contenido completo del ZIP al repositorio existente, incluyendo la carpeta scripts y package.json. Espera a que Cloudflare termine el despliegue y abre la página con internet. No ejecutes schema.sql ni recrees la base o los planes.

El build prepara un service worker para la página y sus recursos estáticos. Ninguna respuesta de /api/, sesión ni petición de cierre de sesión se guarda en esa caché. El service worker no envía acciones de negocio en segundo plano.

## Preparar el celular antes de salir

1. Inicia sesión con la cuenta del técnico desde una ventana normal. No uses incógnito.
2. Abre Trabajo sin conexión en el menú. El acceso también aparece en el formulario de inicio de sesión.
3. Elige una clave sin conexión de al menos ocho caracteres y pulsa Descargar visitas. Conserva la clave: sin ella no se recupera la descarga cifrada.
4. Se descargan hasta doce visitas con listas, asignadas al técnico y disponibles según su fecha: hoy, mañana y pendientes anteriores. No se descargan las visitas de semanas posteriores. Las fechas recientes se priorizan si hay más de doce pendientes.
5. Comprueba que aparecen las visitas. Recarga esa pantalla con modo avión para probar que abre, desbloquea y permite trabajar antes de usarlo en un servicio real.

La descarga se debe renovar con internet cada 72 horas. La app solicita almacenamiento persistente al navegador, pero no todos los dispositivos lo conceden. Borrar los datos del sitio, desinstalar la app web o limpiar el navegador puede eliminar datos locales. Usa Descargar respaldo cifrado si necesitas conservar una copia, y guarda también la clave por separado. El respaldo se puede restaurar en una instalación sin descarga existente; necesita la misma clave original.

## En campo

Trabaja desde Trabajo sin conexión, incluso si al inicio hay señal. Abre la visita, inicia el mantenimiento, guarda cada resultado y fotografía y avanza por las etapas. Escribir sin pulsar Guardar no confirma una actividad; se avisa antes de cambiar de etapa o salir si hay texto sin guardar. La pantalla normal de mantenimiento continúa requiriendo internet: no convierte sus peticiones fallidas automáticamente en pendientes.

Las fotos se convierten a JPEG con lado mayor de 1280 píxeles, hasta 1 MB por foto y 24 fotos por visita. Se limita a 40 MB de fotos locales pendientes por dispositivo. Si se alcanza el límite, hay que sincronizar antes de agregar otras. El sistema no elimina fotos pendientes para liberar espacio.

Puedes bloquear la descarga para que pida otra vez su clave. Cerrar sesión en la plataforma no borra el trabajo local. Como en cualquier herramienta sin conexión, una suspensión o reasignación remota solo se verifica cuando vuelve la conexión; el servidor siempre valida permisos antes de recibir datos.

## Sincronizar y cerrar

Abre Trabajo sin conexión con internet, desbloquea y pulsa Sincronizar ahora. También se intenta sincronizar al desbloquear con señal o cuando esta pantalla detecta que vuelve la conexión. No se garantiza envío con el navegador o la app cerrados, especialmente en iPhone.

Si la sesión del servidor venció, inicia sesión en la plataforma con la misma cuenta y regresa. No se envían cambios bajo una cuenta diferente. El técnico sigue necesitando tener la visita asignada.

Los archivos se envían con identificadores estables, y las operaciones tienen recibos para que un reintento no duplique fotos o avances. Cuando el servidor confirma el guardado y el dispositivo registra la confirmación, se eliminan las copias locales de las fotos ya enviadas. El resto del borrador se conserva como sincronizado.

Si otra sesión cambió la visita, o la cerró o reasignó, se detiene el envío. El borrador local permanece disponible y cifrado; no sobrescribe el servidor. Descarga un respaldo y compara ambas versiones con el administrador. La resolución de ese conflicto es manual en esta versión.

Al completar las etapas sin conexión, sincroniza y abre la misma visita desde Agenda de servicios. Confirma el cierre en línea para generar el PDF y publicarlo en el portal. No se generan ni publican PDF, facturas, cambios administrativos ni archivos de Drive sin internet. La conexión automática con Drive sigue pendiente de configuración e implementación.

## Pruebas realizadas

TypeScript, compilación Vite y generación del shell offline. Pruebas con IndexedDB simulado, Web Crypto y SQLite en memoria: cifrado y clave incorrecta; persistencia tras recarga; respaldo/restauración con fotos; conflictos entre pestañas; envío de fotos; sincronización y reintentos sin duplicados; limpieza solo tras confirmación; conflicto conservando borrador; cuenta equivocada y permisos. Pruebas del service worker en entorno simulado: caché de recursos existentes, apertura sin red y exclusión de las rutas API y logout. Se repitieron las pruebas de mantenimiento por etapas y administración de accesos.

Falta la prueba integral con modo avión en Safari/iPhone y Chrome/Android reales, y la verificación en la instalación del usuario. Esta es una versión preparada para piloto, no una certificación de funcionamiento en todos los dispositivos. La revisión automática de aprobación bloqueó la comprobación con Wrangler por posible envío a Cloudflare; no se completó ese paso ni se desplegó esta actualización desde el chat.

Pruebas locales: npm run check; node tests/offline.test.mjs; node tests/maintenance.test.mjs; node tests/technician-access.test.mjs; npm run build; node tests/offline-shell.test.mjs.
