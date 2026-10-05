# Contexto del proyecto — Salud Protegida

Resumen de lo trabajado y decidido hasta el 2026-10-05 (exportado desde la sesión de la app/API). Los datos de esquema salen de `docs/user_tab_columns.csv` (export real de `user_tab_columns`) y del código PL/SQL pegado; lo no confirmado está marcado **(sin confirmar)**.

## 1. Los tres proyectos

| Proyecto | Ruta | Stack | Puerto dev |
|---|---|---|---|
| App del paciente | `D:\Proyectos\salud-protegida` | Expo / React Native (SDK 56, también web) | 8081 |
| API | `D:\Proyectos\salud-protegida-api` | Node/Express + Oracle (`oracledb`, Instant Client `C:\instantclient_21_22`) | 3001 |
| CRM de personal | `D:\Proyectos\salud-protegida-crm` | Vite + React | 5173 |

- La API corre con `node index.js` (sin nodemon): reiniciar a mano; eso vacía el caché de `/uso-plan`.
- Conexiones Oracle (`db/connection.js`): `getConnection` (cuenta técnica amplia), `getConnectionCRM` (cuenta acotada del CRM), `getConnectionApp` (cambios del paciente desde la app, para auditoría), `getConnectionComoUsuario` (login de empleados con su usuario Oracle real) y `marcarUsuarioReal` (setea `CLIENT_IDENTIFIER` para que los triggers `_JN` auditen a la persona real).
- Variables de entorno (solo nombres): `DB_USER/PASSWORD/HOST/PORT/SERVICE`, `CRM_DB_*`, `APP_DB_*`, `JWT_SECRET`, `CRM_JWT_SECRET`, `MEDICO_JWT_SECRET`, `JITSI_ROOM_SECRET`, `ALLOWED_ORIGINS`.

### Estado de repositorios
- Solo la app es repo git (rama `master`), sin remote. La API y el CRM no tienen `.git`.

## 2. Decisiones de trabajo

1. No tocar procesos existentes de producción en Oracle: preferir objetos nuevos (vistas, funciones, triggers).
2. No reinventar lo que Oracle ya resuelve (`OBT_TOPE_COBERTURA_CLIENTE`, `OBT_USO_NOMENCLADOR_CLIENTE` ya resuelven grupo familiar, cobertura afecta y período). Node solo parsea y presenta.
3. Visaciones sigue manual por WhatsApp.
4. Presupuestos quirúrgicos: pausado. Teleconsulta (Daily.co): pausada. Despliegue/red: sin acción.
5. Límite de 30 caracteres para nombres de objetos Oracle.

## 3. Seguridad (implementado)

- Secretos JWT separados por subsistema (paciente / CRM / médico).
- CORS restringido (`ALLOWED_ORIGINS`).
- Errores crudos de Oracle no se devuelven al cliente.
- Rate limit de login (10 intentos / 15 min por IP).
- `npm audit fix` en la API: 0 vulnerabilidades. App: 23 vulnerabilidades sin investigar.

## 4. Uso del Plan

- Endpoint `GET /api/afiliado/uso-plan` (caché 20 min; ~15-20 s en frío). Vistas/funciones: `V_COBERTURA_CLIENTE_AFECTA`, `OBT_MONTO_USO_NOMEN_CLIENTE` (SQL en `docs/sql/`).
- Tope en 0 = ilimitado (`'IL'`, `DECODE` devuelve VARCHAR2) salvo que haya `MONTO_CUBIERTO` > 0: el límite real es un monto en guaraníes. Pueden darse ambos (cantidad y monto).
- Cobertura Afecta: cupo compartido entre nomencladores; `GRUPAL='SI'` suma el uso del grupo familiar. ID 16 "ILIMITADO SEGUN CONTRATO" es placeholder, no se agrupa.
- Tipos de tope (`TIPO_TOPE_CBT`): 1 POR CONTRATO, 2 UNICA VEZ, 3 MENSUAL, 4 POR EVENTO, 5 SEMESTRAL, 6 ANUAL, 7 DIARIO.
- Anomalía a confirmar: en `OBT_CANT_VISA_REALIZADA` ANUAL (6) se filtra como POR CONTRATO (no resetea cada año).
- Carencia (`CARENCIA`, `CARENCIA_POR_INACTIVO`) existe pero no se muestra.
- Funciones: `OBT_USO_NOMENCLADOR_CLIENTE`, `OBT_TOPE_COBERTURA_CLIENTE`, `OBT_CANT_VISA_REALIZADA` (procedimiento), `OBT_MONTO_USO_NOMEN_CLIENTE` (nueva), `OBTENER_ID_COBERTURA_CLIENTE`. Devuelven `-1` si no hay cobertura.

## 5. Tablas clave

Detalle (462 columnas, 18 objetos) en `docs/user_tab_columns.csv`: `COBERTURA_CLIENTE, COBERTURA_AFECTA, TIPO_TOPE_CBT, COBERTURA_CLIE_PRESTADOR, SRV_PREPAGA, VISACION, DET_VISACION, PRESUPUESTO_SRV, DET_PRESUPUESTO, NOMENCLADOR, GRUPO_NOMENCLADOR, CLIENTE, CONTRATO_CLIENTE, TARIFA, PRESTADOR, APP_ESPECIALIDAD_ESTUDIO, V_COBERTURA_CLIENTE, V_COBERTURA_CLIENTE_AFECTA`.

## 6. Visaciones

- PDF del comprobante: `GET /api/visaciones/:id/pdf` sirve el PDF generado por Forms/Reports en `\\sp-fileserver\Archivos$\v<ID_VISACION>.pdf`.
- Nueva solicitud: foto con `expo-image-picker`, se comparte y luego se abre `wa.me/595213190000`. Pendiente verificar en navegador real.

## 7. Otras notas

- Especialidades "truchas": tabla `APP_ESPECIALIDAD_ESTUDIO` + `obtenerEspecialidadesTruchas(conn)`.
- Ante dudas de negocio sobre coberturas, preguntar: la fuente de verdad es el formulario Oracle Forms de `COBERTURA_CLIENTE`.

## 8. Pendientes

1. Verificar tarjetas con monto ("MEDICAMENTOS - CIRUGIAS", "COBERTURA ESPECIAL").
2. Confirmar comportamiento de ANUAL (6).
3. Decidir si mostrar carencia.
4. Confirmar casos reales con `COB_MONTO_ID_COBERTURA_MONTO`.
5. Verificar WhatsApp en navegador real.
6. Remote git; versionar API y CRM.
7. Revisar 23 vulnerabilidades npm en la app.
8. Retomar Presupuestos, Teleconsulta y portal médico (`R_MEDICO`).
