# Documentos de Drive dentro del portal

Esta versión consulta la carpeta asignada al condominio desde el servidor. El cliente inicia sesión en el portal, sin necesitar iniciar sesión en Google. No se hace pública la carpeta y no se envía ninguna credencial al navegador.

## Activación

1. En https://console.cloud.google.com/ selecciona o crea el proyecto PC TECHNOSYSTEM.
2. En APIs y servicios → Biblioteca, habilita Google Drive API.
3. En IAM y administración → Cuentas de servicio, crea una cuenta llamada portal-documentos. No necesita roles administrativos del proyecto ni delegación de dominio.
4. Abre esa cuenta → Claves → Agregar clave → Crear clave nueva → JSON. Guarda el archivo en un lugar privado. No lo envíes por chat, no lo subas al repositorio ni lo incluyas en este ZIP.
5. En Cloudflare → Workers y Pages → pc-technosystem-servicios → Settings → Variables and Secrets, añade un secreto llamado GOOGLE_DRIVE_SERVICE_ACCOUNT. Pega como valor el contenido completo del JSON. Guarda y aplica el cambio. Debe ser secreto, nunca una variable VITE_ ni texto del código.
6. Copia el correo de esa cuenta de servicio (termina en iam.gserviceaccount.com). En Google Drive, comparte la carpeta de documentos de Vela Towers con ese correo como Lector.
7. En el portal, Administración y flota → Condominios y documentos, registra o actualiza la ficha de Vela Towers con el enlace de esa carpeta. Al actualizar una ficha, selecciona su registro y vuelve a completar los datos de la ficha. Evita crear registros duplicados.
8. Publica el código actualizado mediante tu flujo habitual de GitHub y Cloudflare. No ejecutes schema.sql otra vez: esta función no requiere cambios de tablas.

Comparte únicamente la carpeta que deseas mostrar al cliente: todos sus documentos y subcarpetas serán visibles a los contactos activos del condominio en el portal. Se excluyen accesos directos para evitar saltar hacia otras carpetas. No incluyas contraseñas técnicas ni documentos internos en esa carpeta. La cuenta de servicio solo debe recibir acceso de Lector a las carpetas necesarias. No necesitas publicar la carpeta con “cualquier persona con el enlace”. El acceso anterior que hayas dado a correos personales en Drive sigue existiendo independientemente del portal.

## Uso

El cliente abre Mi condominio → Condominios y documentos. Ve nombres, fechas de actualización, carpetas y botones Ver documento / Descargar. Los PDF y las fotos compatibles se muestran dentro de la página; Documentos, Hojas y Presentaciones de Google se exportan a PDF para consulta (pueden aplicar límites de exportación de Google). Otros archivos se descargan. El navegador debe soportar mostrar PDF; si no lo hace, se ofrece descarga.

La lista se consulta al abrir cada carpeta, al volver a la ventana y cada minuto mientras esa sección está visible. Actualizar permite consultar antes. Los cambios no son notificaciones instantáneas: los archivos nuevos aparecen en la siguiente consulta, y los que se retiran dejan de estar disponibles. La búsqueda aplica a los documentos cargados de la carpeta actual; Cargar más consulta la siguiente página de 100 elementos.

Esta función es de lectura con conexión a internet. No copia documentos al almacenamiento local ni al modo sin conexión. No modifica Drive, no sube automáticamente los PDF de mantenimientos del portal a Drive y no importa archivos de Drive a la tabla de reportes: los presenta en una sección independiente de documentos. Un documento ya descargado por el cliente no puede revocarse de su dispositivo.

## Prueba con Vela Towers

Con el código publicado y el secreto configurado, entra con un contacto de prueba autorizado de Vela Towers. Comprueba que puedes abrir PDF y fotos, navegar una subcarpeta y descargar un archivo. Sube a Drive un PDF de prueba y espera un minuto o pulsa Actualizar. Renómbralo y retíralo para verificar los cambios. Comprueba con otro cliente que no aparece la documentación de Vela Towers. Repite la vista PDF en Android y iPhone.

## Validación local

npm run check
node tests/drive.test.mjs
npm run build
node tests/offline-shell.test.mjs

Las pruebas utilizan respuestas simuladas de Google y validan firma JWT, lectura sin permisos de escritura, límites de carpeta, exclusión de accesos directos y archivos eliminados, aislamiento entre clientes y consultas sin caché. No sustituyen la prueba real después de configurar Google y publicar. Una limitación administrativa de Google puede impedir crear claves de servicio; en ese caso será necesario configurar OAuth en una implementación posterior.

Referencias: https://developers.google.com/identity/protocols/oauth2/service-account y https://developers.google.com/workspace/drive/api/guides/manage-downloads
