# Autenticacion y roles del CRM

Se mantiene el modelo de seguridad de Forms (`buscar_codigo_prg`: PROGRAMA + PROGRAMA_ROL + PRIVILIGES por `USER`).

1. `POST /api/crm/auth/login {usuario, password}` valida contra Oracle abriendo una sesion con las credenciales del empleado. Se emite un JWT con el usuario; la clave no se guarda.
2. Cada ruta protegida usa `requirePrograma('<PROGRAMA.DESCRIPCION>')`, que abre una sesion proxy
   (`pool.getConnection({user})`) y ejecuta `buscar_codigo_prg` sin modificarla. Asi `USER` es el empleado real,
   tambien para la logica de reemplazos (`OBT_USER_ES_REEMPLAZO`).

## Requisito en Oracle (una vez por empleado, lo hace el DBA)
    ALTER USER <empleado> GRANT CONNECT THROUGH anamnesis;

## Pendiente
- Definir los nombres de programa del CRM (alta en PROGRAMA / PROGRAMA_ROL por departamento).
- Mapear columnas de GESTION_COBRO, RENOVACION_CLIENTE, etc. (`user_tab_columns`) antes de crear rutas de datos.
- Crear las 4 tablas CRM_* cuando se confirme su DDL.
