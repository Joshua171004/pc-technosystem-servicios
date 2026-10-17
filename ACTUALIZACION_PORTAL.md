# Actualización del portal PC TECHNOSYSTEM

Versión preparada sobre el repositorio existente. Conserva login, agenda, técnicos, calendario y reportes.

## Uso

Administrador: abre «Administración y flota».

1. Registra primero al cliente en «Clientes y reportes».
2. En «Condominios y Drive», escribe su dirección, coordenadas y enlace a su carpeta existente. Para modificar una ficha selecciona la ficha e introduce de nuevo todos sus valores. Google Drive conserva sus permisos; comparte la carpeta solo con los correos del cliente. No hay sincronización OAuth todavía.
3. En «Facturas y pagos», registra folio, importe total MXN y vencimiento de la factura de Aspel; adjunta PDF y XML de hasta 8 MB cada uno. El XML se almacena como documento: no extrae ni verifica campos fiscales. La carga es manual; no hay conexión automática con Aspel. Registra abonos para calcular el saldo. El sistema permite registrar excedentes y los muestra separadamente.
4. En «Incidencias», el cliente registra el detalle en texto y el administrador responde y cambia el estado. Esta versión no admite fotos en incidencias ni las convierte automáticamente en órdenes de trabajo.
5. En «Flota vehicular», registra unidades, conductor, cargas de combustible y servicios. El kilometraje mostrado es el máximo registrado. El último servicio por fecha define el próximo servicio; sus campos vacíos dejan el umbral sin definir. Los avisos se muestran al abrir la plataforma: no envía notificaciones ni correos. No hay comprobantes de combustible ni cálculo de rendimiento todavía.

Clientes: ven las nuevas secciones debajo de sus mantenimientos y reportes. Se filtran por su contacto autorizado; técnicos no acceden a los nuevos datos administrativos. Cada contacto continúa vinculado a un solo cliente como en la versión anterior. El acceso de una misma administración a varios clientes queda pendiente.

## Instalación en la aplicación existente

Sube el contenido del paquete al mismo repositorio GitHub, en su raíz, conservando los archivos y carpetas. Si el Worker sigue conectado a esa rama, el cambio debe iniciar su compilación. Verifica el resultado en Cloudflare antes de usarlo.

No ejecutes de nuevo schema.sql ni crees otra base: estos módulos usan la tabla settings existente con claves ops: y archivos privados en el bucket actual. Conserva tus bindings DB y BUCKET y tu configuración de secretos. No contiene ni requiere nuevas contraseñas predeterminadas.

Validación realizada: TypeScript, compilación Vite, empaquetado Wrangler en dry-run y pruebas simuladas de permisos, aislamiento por cliente, archivos privados, origen, importes y coordenadas. Falta la prueba integral en navegador y la validación con la base real y los dispositivos del usuario. No desplegado por este paquete.

## Pendiente para automatización

Confirmar producto y versión Aspel (por ejemplo SAE o FACTURE), dónde se instala y cómo se exportan los XML/PDF. Configurar un conector o importador con credenciales y permisos del usuario antes de prometer sincronización. La geolocalización actual corresponde a la ficha del condominio: no registra entradas/salidas ni seguimiento del técnico.
