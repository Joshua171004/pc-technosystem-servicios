# Prueba de mantenimiento The Leaf

Esta actualización conserva administración, facturas, flota, agenda, técnicos y portal. Añade planes de visitas, ejecución con actividades y generación de PDF.

## Preparación

1. Actualiza el mismo repositorio con el contenido del ZIP del proyecto y verifica la compilación en Cloudflare. No ejecutes schema.sql de nuevo y conserva los bindings y secretos existentes.
2. Registra The Leaf y a Joshua Lopez Gonzalez en las secciones existentes, si aún no aparecen. Crea el acceso de Joshua con el mismo correo del técnico.
3. Abre Planes de mantenimiento. El formulario propone un ciclo de ocho sábados basado en el inventario indicado. Modifica actividades o añade/quita visitas antes de guardar. Puedes añadir « | foto» al final de una actividad para exigir evidencia si se marca realizada.
4. Guarda el plan y programa su primer sábado. Generará un ciclo completo con una visita cada siete días, incluyendo los quintos sábados. No crea recurrencia infinita: al finalizar se programa otro ciclo. No cambies por SQL fechas de visitas del ciclo: el respaldo mensual se calcula al programarlas.
5. Se añaden automáticamente instrucciones de respaldo AxTrax al último sábado de cada mes del ciclo. El técnico confirma que lo realizó; la plataforma no ejecuta por sí sola el respaldo del servidor AxTrax.
6. En Administración y flota registra la dirección de The Leaf y su carpeta Drive; se usarán para consulta y dirección del PDF.

## Referencia técnica del Excel

Se entrega por separado The_Leaf_Referencia_Tecnica_Privada.json, preparado del Excel original. NO lo subas a GitHub ni a public/ del proyecto. En Planes de mantenimiento, usa Importar referencia interna y selecciona The Leaf. El archivo se almacena en el bucket privado de la aplicación.

Un técnico solo lo consulta desde un trabajo que tenga asignado y vinculado a ese cliente. Incluye las cuatro secciones originales del Excel, buscador y contraseñas ocultas inicialmente. Las concesiones DHCP se conservan como referencia histórica: no se consideran direcciones confirmadas en tiempo real. No se incluye en reportes del cliente ni en sus fotos. No se ha deducido un inventario activo a partir del Excel; el alcance del plan continúa siendo las 64 cámaras indicadas por el usuario.

## Técnico

Abre una visita desde agenda/calendario y pulsa Iniciar mantenimiento. Guarda cada actividad como Realizada, Con falla o No realizada; usa Pendiente mientras trabajas. Las fallas y tareas no realizadas requieren explicación. Adjunta fotos por actividad y una descripción. Se convierten a JPG de hasta 1280 píxeles; se aceptan hasta 24 fotos por visita y 1 MB por foto procesada. Esta versión necesita conexión para guardar y no tiene modo sin internet.

Guarda materiales, resumen y observaciones del reporte. Al finalizar, confirma el cierre: el servidor verifica actividades y evidencias, genera un PDF con el membrete del machote, publica el reporte en el portal del cliente y marca el trabajo Terminado. Solo se publican los datos guardados de la lista; las notas internas anteriores del trabajo no se copian. Las fotos de actividades sí se incluyen. No adjuntes bases de datos ni claves a las evidencias.

El nombre del técnico y del encargado se muestran como responsables. La captura de firmas todavía no está implementada; el PDF lo indica. Las visitas cerradas no se editan desde este flujo. Repetir la petición de cierre no duplica el reporte.

## Drive y publicación

La entrega automática del PDF a Google Drive NO está implementada/configurada todavía. El reporte queda disponible en la aplicación y muestra ese estado pendiente. El enlace a la carpeta no concede a la aplicación permiso para escribir. El respaldo de AxTrax tampoco se sube al portal.

No se pudo subir el código al repositorio por la conexión GitHub: devolvió 403 Resource not accessible by integration. Este paquete está preparado localmente; no afirma un despliegue en Cloudflare.

## Validación

TypeScript, Vite, empaquetado Worker dry-run, pruebas con SQLite en memoria: ocho sábados, respaldo mensual, programación duplicada, permisos de técnico y cliente, inicio, actividades, fotos requeridas, cierre y publicación sin duplicados, archivos privados y referencia interna excluida del cliente. PDF real generado y renderizado para revisar páginas. Falta la prueba integral en navegador y con los dispositivos y base reales. Las pruebas se ejecutan con node tests/maintenance.test.mjs. El generador de ejemplo de PDF usa datos simulados, no acredita un servicio realizado.

## Actualización por etapas y disponibilidad del técnico

El mantenimiento se divide en cinco etapas: Inicio, Revisión general, Actividades de la visita, Datos del reporte y Revisión y cierre. El botón Siguiente valida resultados, evidencias obligatorias y explicaciones de fallas o actividades no realizadas. La interfaz avisa si hay cambios sin guardar antes de cambiar de etapa. Anterior permite corregir etapas ya recorridas antes del cierre. Los controles también se validan en el servidor.

Las visitas existentes se adaptan al consultar sus listas, usando el número de actividades generales de su plan. No hay que volver a programar ni ejecutar el esquema de la base. Las visitas cerradas conservan sus reportes.

La agenda y el calendario del técnico muestran mantenimientos cuya fecha sea hoy, mañana o anterior, según America/Cancun. Los mantenimientos de fechas posteriores no se devuelven en sus datos ni pueden abrirse por enlace directo. Los trabajos que no sean de tipo Mantenimiento conservan su disponibilidad anterior. El técnico entra por defecto al filtro Pendientes; puede consultar servicios anteriores con Todos. Administración conserva toda la programación. La vista de prueba de técnico del administrador aplica también el filtro visual; no equivale a una cuenta técnica real para verificar permisos.

Una visita de sábado aparece desde las 00:00 del viernes, en Cancún. Esto se basa en días de calendario y no en 24 horas antes de una hora concreta. La agenda se refresca cada minuto si está visible y al regresar a la pestaña. No se han añadido avisos por WhatsApp o notificaciones.

Para aplicar: sube el contenido de la nueva versión del ZIP al mismo repositorio y espera el despliegue Ready. Conserva la base y los planes actuales. Después recarga la página y prueba con la cuenta del técnico. Sigue pendiente la prueba integral en navegador y en dispositivos reales.

## Edición de accesos técnicos

En Accesos aparece una lista de técnicos con búsqueda y el botón Editar acceso. Equipo técnico incluye un acceso directo a esa sección. Se puede editar nombre y correo, crear o restablecer contraseña y suspender/reactivar. Si el acceso ya existe y dejas la contraseña vacía, conserva la actual; no se muestra ni recupera la contraseña anterior. Un acceso nuevo necesita una contraseña de 12 a 128 caracteres para habilitarlo.

Guardar conserva el ID del técnico y sus asignaciones, sincroniza nombre y correo de su cuenta y cierra las sesiones anteriores. Suspender conserva su historial e impide iniciar sesión. Solo el administrador puede gestionar estos cambios. El administrador no se modifica desde la lista de técnicos. Los correos usados por otros técnicos, cuentas o contactos se rechazan. Restablecer la contraseña desde el formulario por correo conserva el estado suspendido: para habilitarlo usa Editar acceso y selecciona Activo.

Validación adicional: node tests/technician-access.test.mjs comprueba permisos, edición de correo y nombre, hash conservado al no cambiar la contraseña, restablecimiento, suspensión, reactivación, revocación de sesiones, colisiones de correo, protección del administrador y origen de la petición.
