export const leafInventory='64 cámaras (16 por torre A, B, C y D); 8 IDF en torres; site de administración; IDF de comedor; 4 interfones; AP de áreas comunes (cantidad por confirmar); 4 barreras (2 entrada y 2 salida); Rosslare y acceso peatonal con huella.';
export const routine=[
'Revisar imagen de las 64 cámaras y documentar cualquier canal sin señal | foto',
'Comprobar reproducción de grabaciones recientes, almacenamiento y fecha y hora de los grabadores | foto',
'Probar funcionamiento de las 4 barreras y del control de accesos Rosslare | foto',
'Probar acceso peatonal con huella',
'Comprobar conectividad de internet y AP de áreas comunes'];
export const leafVisits=[
{title:'Torre A - cámaras e interfon',tasks:['Revisar las 16 cámaras de torre A, enfoque, fijaciones y conexiones accesibles','Limpiar lentes y carcasas accesibles de torre A | foto','Probar llamada y audio del interfon de torre A']},
{title:'Torre B - cámaras e interfon',tasks:['Revisar las 16 cámaras de torre B, enfoque, fijaciones y conexiones accesibles','Limpiar lentes y carcasas accesibles de torre B | foto','Probar llamada y audio del interfon de torre B']},
{title:'Torre C - cámaras e interfon',tasks:['Revisar las 16 cámaras de torre C, enfoque, fijaciones y conexiones accesibles','Limpiar lentes y carcasas accesibles de torre C | foto','Probar llamada y audio del interfon de torre C']},
{title:'Torre D - cámaras e interfon',tasks:['Revisar las 16 cámaras de torre D, enfoque, fijaciones y conexiones accesibles','Limpiar lentes y carcasas accesibles de torre D | foto','Probar llamada y audio del interfon de torre D']},
{title:'IDF de las cuatro torres',tasks:['Revisar los 2 IDF de torre A: limpieza, conexiones, alimentación y enlaces de cámaras y repetidores | foto','Revisar los 2 IDF de torre B: limpieza, conexiones, alimentación y enlaces de cámaras y repetidores | foto','Revisar los 2 IDF de torre C: limpieza, conexiones, alimentación y enlaces de cámaras y repetidores | foto','Revisar los 2 IDF de torre D: limpieza, conexiones, alimentación y enlaces de cámaras y repetidores | foto']},
{title:'Site y red de áreas comunes',tasks:['Revisar site de administración: equipos, conexiones y ventilación | foto','Revisar IDF de comedor: conexiones, alimentación y orden del cableado | foto','Revisar físicamente AP accesibles y comprobar cobertura en áreas comunes; registrar puntos probados']},
{title:'Barreras de entrada',tasks:['Revisar barrera de entrada 1: fijaciones, movimiento, conexiones y dispositivos de seguridad | foto','Revisar barrera de entrada 2: fijaciones, movimiento, conexiones y dispositivos de seguridad | foto','Limpiar y realizar ajustes permitidos por el fabricante; documentar anomalías y repuestos necesarios']},
{title:'Barreras de salida y Rosslare',tasks:['Revisar barrera de salida 1: fijaciones, movimiento, conexiones y dispositivos de seguridad | foto','Revisar barrera de salida 2: fijaciones, movimiento, conexiones y dispositivos de seguridad | foto','Revisar eventos y comunicación de Rosslare, lectoras y acceso peatonal','Revisar pendientes del ciclo y registrar recomendaciones']}
];
