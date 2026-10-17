# PC TECHNOSYSTEM — versión para tu propia cuenta de Cloudflare

Esta carpeta contiene una aplicación independiente de ChatGPT Sites. Conserva agenda, calendario, técnicos, fotos, clientes y publicación de reportes. Incluye acceso con correo y contraseña, sin cuentas de ChatGPT.

## Estado
- Interfaz compilada y TypeScript comprobado.
- Empaquetado del Worker verificado con Wrangler en modo dry-run.
- Pruebas de autenticación, roles, sesiones, revocación y CSRF correctas con SQLite local y solicitudes simuladas.
- Aún NO desplegada en tu cuenta de Cloudflare. Aún falta la prueba integral en navegador y en los teléfonos reales.
- Base de datos NUEVA: no contiene reportes ni fotos del sitio anterior. No se han cambiado ni eliminado los datos originales.
- No incluye contraseñas predeterminadas, tokens ni claves de tu cuenta.
- No incluye recurrencias automáticas ni instalación PWA todavía.

## 1. Subir a GitHub desde el navegador
1. Descomprime el ZIP en tu Mac.
2. Abre https://github.com/Joshua171004/pc-technosystem-servicios
3. Pulsa Add file > Upload files.
4. Arrastra el CONTENIDO de esta carpeta (archivos package.json, wrangler.jsonc, index.html, schema.sql, y carpetas src, server y public). No subas el ZIP como archivo ni una carpeta adicional que los encierre.
5. Pulsa Commit changes. Si el repositorio ya tenía README.md, puedes reemplazarlo por estas instrucciones cuando lo desees.
6. El archivo package.json debe aparecer en la página principal del repositorio.

No hace falta instalar Node en tu Mac para este procedimiento.

## 2. Crear la base D1
En Cloudflare busca D1 SQL Database y crea una base llamada pc-technosystem-db.
Abre su consola, pega el contenido COMPLETO de schema.sql y ejecútalo UNA SOLA VEZ en esa base NUEVA. No ejecutes este esquema en una base anterior con datos.
Copia el Database ID que muestra Cloudflare.
En GitHub, edita wrangler.jsonc y cambia REEMPLAZAR_CON_ID_D1 por ese identificador. Guarda con Commit changes. No cambies el nombre del binding DB.

## 3. Fotografías R2
En Cloudflare busca R2 y crea un bucket PRIVADO llamado pc-technosystem-evidencias.
No actives acceso público al bucket: las fotos se sirven mediante endpoints que verifican permisos.
R2 puede pedir configurar facturación. Revisa lo que autoriza la pantalla antes de aceptar. Tiene cuota gratuita, pero el exceso de almacenamiento u operaciones puede cobrarse. El código no establece un tope global de gasto o almacenamiento.

## 4. Conectar GitHub a Workers
Busca Workers & Pages > Create application > conexión con GitHub (los nombres pueden variar).
Selecciona el repositorio pc-technosystem-servicios.
Configura como WORKER, no como un sitio estático ni un proyecto Pages.
- Nombre: pc-technosystem-servicios (debe coincidir con wrangler.jsonc).
- Rama: main.
- Directorio raíz: la raíz del repositorio, donde está package.json.
- Build command: npm run build
- Deploy command: npx wrangler deploy
Cloudflare instalará las dependencias. Si aparece elección de Node, usa 22.13 o posterior; Node 22 actual sirve.
No ejecutes despliegues de ramas de prueba contra la misma base de producción sin separar los bindings.

## 5. Configurar la clave de instalación
En el Worker, Settings > Variables and Secrets, agrega un SECRET llamado SETUP_TOKEN.
Elige una clave aleatoria privada de al menos 32 caracteres. No la subas a GitHub ni la pegues en chats. No es tu contraseña de Cloudflare.
Guarda/aplica el secreto en producción. Si Cloudflare solicita desplegar de nuevo para aplicarlo, hazlo.
Abre la URL workers.dev de tu aplicación. Verás el formulario de configuración inicial.
Escribe la clave de instalación, tu nombre, tu correo y una contraseña propia de al menos 12 caracteres.
Después inicia sesión con ese correo y contraseña. Una vez creado el administrador, la ruta de configuración queda bloqueada. Puedes retirar SETUP_TOKEN después del primer acceso.
Si la página informa un error de base de datos, revisa antes el esquema y los bindings DB y BUCKET; no vuelvas a ejecutar a ciegas schema.sql.

## 6. Técnicos y clientes
- Equipo técnico: registra nombre y correo de Joshua u otros técnicos.
- Accesos: escribe su mismo correo y crea su contraseña. Compártela personalmente por un canal privado. No se envían correos automáticamente.
- Crea trabajos y asígnalos al técnico.
- Clientes y reportes: crea el cliente y su contacto. En Accesos crea su contraseña.
- Abre un trabajo y vincúlalo al cliente registrado para que aparezca en su portal.
- Cuando el trabajo esté Terminado, redacta el reporte final, elige si incluyes las fotos y publícalo.
- Las notas internas no se copian automáticamente al reporte público.
- Un cliente tiene acceso solo a sus mantenimientos y reportes publicados, sin permisos para modificar trabajos.
- Suspender un contacto bloquea sus datos. Restablecer una contraseña cierra sus sesiones existentes.

## 7. Prueba recomendada
Usa un trabajo identificado como PRUEBA y un cliente ficticio. Verifica administrador → técnico → fotografías → terminar → publicar → cliente. Usa otro navegador o una ventana privada para cada rol.
Comprueba que el cliente no puede abrir fotografías o reportes de otro cliente y que un técnico no puede modificar trabajos de otro.

## 8. Mantenimiento y límites
Las sesiones duran 12 horas. Hay límites de intentos de acceso. Las fotos aceptadas son JPG/PNG/WebP de hasta 8 MB por archivo.
No hay recuperación automática por correo: el administrador restablece contraseñas de técnicos/clientes desde Accesos. Conserva de forma segura la contraseña del administrador; su recuperación requiere intervención técnica en D1.
Haz respaldos de D1 y R2 antes de cambios importantes. No se incluyen respaldos automáticos.
Usar subdominio workers.dev evita contratar un dominio adicional. Comprueba los límites y facturación de tu cuenta; no se garantiza coste cero para cualquier volumen de uso.

## Archivos principales
src/: interfaz reutilizada y adaptada.
server/: Worker, autenticación y API.
schema.sql: esquema inicial para una D1 nueva.
wrangler.jsonc: enlaces D1, R2 y archivos estáticos.
package.json: comandos y dependencias.

## Desarrollo local opcional (cuando tengas Node)
npm install
npm run build
npx wrangler d1 execute pc-technosystem-db --local --file=schema.sql
Crea .dev.vars con SETUP_TOKEN y tu clave privada. Nunca subas ese archivo.
npx wrangler dev
Usa la URL local que muestre Wrangler. Los datos locales y alojados son independientes.
