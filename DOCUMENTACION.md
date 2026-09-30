# Documentación del proyecto TP4: API REST de música

API backend hecha con **Node.js + Express 5 + PostgreSQL**. Gestiona usuarios, canciones y escuchas (reproducciones), con autenticación por JWT y roles (usuario / administrador).

## Índice

1. [Qué hace el sistema](#1-qué-hace-el-sistema)
2. [Tecnologías](#2-tecnologías)
3. [Estructura del proyecto](#3-estructura-del-proyecto)
4. [Arquitectura en capas](#4-arquitectura-en-capas)
5. [Configuración y variables de entorno](#5-configuración-y-variables-de-entorno)
6. [Modelo de datos](#6-modelo-de-datos)
7. [Autenticación y autorización](#7-autenticación-y-autorización)
8. [Referencia de endpoints](#8-referencia-de-endpoints)
9. [Explicación archivo por archivo](#9-explicación-archivo-por-archivo)
10. [Flujos completos de ejemplo](#10-flujos-completos-de-ejemplo)
11. [Cómo ejecutarlo](#11-cómo-ejecutarlo)
12. [Despliegue en Vercel](#12-despliegue-en-vercel)
13. [Decisiones de diseño](#13-decisiones-de-diseño)
14. [Puntos débiles y mejoras sugeridas](#14-puntos-débiles-y-mejoras-sugeridas)
15. [Historial del repositorio](#15-historial-del-repositorio)

---

## 1. Qué hace el sistema

- **Registro y login** de usuarios. Las contraseñas se guardan hasheadas con bcrypt y el login devuelve un token JWT de 1 hora.
- **CRUD de canciones** (crear, modificar, borrar), reservado a administradores (`rol = 'A'`).
- **Registro de escuchas**: cada usuario logueado puede registrar que escuchó una canción. Si ya la había escuchado, se suma una reproducción.
- **Usuario "fan"**: cuando un usuario supera las 10 canciones distintas escuchadas, queda marcado con `fan = true`.

## 2. Tecnologías

| Paquete | Versión | Función |
|---|---|---|
| `express` | ^5.2.1 | Servidor HTTP, ruteo y middlewares |
| `pg` | ^8.23.0 | Cliente de PostgreSQL (se usa `Pool`) |
| `bcrypt` | ^6.0.0 | Hash y comparación de contraseñas |
| `jsonwebtoken` | ^9.0.3 | Firma y verificación de JWT |
| `cors` | ^2.8.6 | Habilita peticiones desde otros orígenes |
| `dotenv` | ^17.4.2 | Carga variables desde `.env` |

`package.json` define `"type": "module"`, por lo que todo el código usa módulos ES (`import` / `export`). Hay que incluir la extensión `.js` en los imports relativos.

## 3. Estructura del proyecto

```
Tp4/
├── index.js                     # App de Express (exportada, sin listen)
├── dbconfig.js                  # Configuración de conexión a Postgres
├── package.json
├── INSOMNIA.md                  # Guía para probar la API con Insomnia
├── DOCUMENTACION.md             # Este documento
├── middlewares/
│   └── auth.js                  # verifyToken y verifyAdmin
├── routes/
│   ├── usuario.routes.js        # /crearusuario, /login
│   ├── cancion.routes.js        # /cancion (POST, PUT, DELETE)
│   └── escucha.routes.js        # /escucho
├── controllers/
│   ├── usuario.controller.js    # Lógica HTTP de usuarios
│   ├── cancion.controller.js    # Lógica HTTP de canciones
│   └── escucha.controller.js    # Lógica HTTP y regla de "fan"
└── services/
    ├── db.js                    # Pool de conexiones
    ├── usuario.service.js       # SQL de usuarios
    ├── cancion.service.js       # SQL de canciones
    └── escucha.service.js       # SQL de escuchas
```

## 4. Arquitectura en capas

```
Cliente
   │  HTTP
   ▼
index.js  ── express.json(), cors()
   │
   ▼
routes/*.routes.js  ── asocia método + URL con middlewares y controlador
   │
   ▼
middlewares/auth.js ── verifyToken → verifyAdmin (según la ruta)
   │
   ▼
controllers/*.controller.js ── valida el body, llama al service, arma la respuesta y el status code
   │
   ▼
services/*.service.js ── consultas SQL parametrizadas
   │
   ▼
services/db.js (Pool) ──► PostgreSQL
```

| Capa | Responsabilidad | Lo que NO hace |
|---|---|---|
| Routes | Declarar endpoints y qué middlewares llevan | No tiene lógica |
| Middlewares | Autenticación y autorización | No toca la base |
| Controllers | Validar entrada, orquestar, responder HTTP | No escribe SQL |
| Services | Ejecutar SQL y devolver filas | No conoce `req` ni `res` |

Ventaja: se puede cambiar el SQL sin tocar el HTTP, o cambiar un status code sin tocar el SQL. También se pueden probar los services por separado.

## 5. Configuración y variables de entorno

Se leen desde un archivo `.env` (ignorado por git) o desde las variables de entorno del hosting.

| Variable | Usada en | Descripción |
|---|---|---|
| `PGHOST` | `dbconfig.js` | Host de la base |
| `PGDATABASE` | `dbconfig.js` | Nombre de la base |
| `PGUSER` | `dbconfig.js` | Usuario de la base |
| `PGPASSWORD` | `dbconfig.js` | Contraseña de la base |
| `JWT_SECRET` | `auth.js`, `usuario.controller.js` | Secreto para firmar y verificar tokens. Si falta usa `'secreto123'` |
| `PORT` | `index.js` | Puerto local (por defecto 3000). Hoy solo se lee, porque `listen` está comentado |

Ejemplo de `.env`:

```env
PGHOST=mi-host.neon.tech
PGDATABASE=tp4
PGUSER=usuario
PGPASSWORD=clave
JWT_SECRET=un-secreto-largo-y-aleatorio
```

`dbconfig.js` fija el puerto en 5432 y activa `ssl: true`, por lo que está pensado para una base en la nube (Neon, Supabase, etc.). Con un Postgres local sin SSL habría que cambiar ese valor.

## 6. Modelo de datos

El repositorio no incluye el script SQL. Este esquema está **deducido de las consultas**. Es una propuesta compatible con el código:

```sql
create table usuario (
  id        serial primary key,
  nombre    varchar(100) unique not null,
  password  text not null,                 -- hash bcrypt
  rol       char(1) not null default 'U',  -- 'U' usuario, 'A' administrador
  fan       boolean not null default false
);

create table cancion (
  id      serial primary key,
  nombre  varchar(200) not null
);

create table escucha (
  usuario_id     int not null references usuario(id),
  cancion_id     int not null references cancion(id),
  reproducciones int not null default 1,
  primary key (usuario_id, cancion_id)
);
```

Relaciones: `usuario` 1—N `escucha` N—1 `cancion`. Es una relación muchos a muchos con un dato extra (`reproducciones`).

Detalles que el código da por supuestos:
- **`rol` tiene default** en la base: `crearUsuario` no lo inserta, y el `returning` lo devuelve.
- **`fan` tiene default `false`**, por lo mismo.
- **`nombre` es único**: la documentación de Insomnia menciona el error por "nombre repetido".
- **Foreign keys en `escucha`**: si la canción no existe, el insert falla con error 500.
- **Borrar una canción con escuchas** fallaría por la foreign key, salvo que se defina `on delete cascade`.
- **Para hacer admin a un usuario** hay que hacerlo directo en la base: `update usuario set rol = 'A' where nombre = 'axel';`

## 7. Autenticación y autorización

### Flujo con JWT

1. El usuario hace `POST /login` con nombre y contraseña.
2. El servidor verifica la clave con `bcrypt.compare` y firma un token con payload `{ id, rol }` y expiración de 1 hora.
3. El cliente guarda el token y lo manda en cada request protegido:
   ```
   Authorization: Bearer <token>
   ```
4. `verifyToken` valida la firma y la vigencia y deja el payload en `req.user`.
5. Si la ruta exige admin, `verifyAdmin` revisa que `req.user.rol === 'A'`.

### Por qué es seguro el diseño básico
- **El token es "stateless"**: el servidor no guarda sesiones. Todo lo necesario está firmado dentro del token.
- **El `id` del usuario sale del token**, no del body. Por eso nadie puede registrar escuchas a nombre de otra persona.
- **Mensaje unificado en login**: "Usuario inexistente o clave incorrecta". No revela si el nombre existe.
- **`returning id, nombre, rol, fan`** en `crearUsuario`: el hash de la contraseña nunca se devuelve al cliente.
- **Consultas parametrizadas** (`$1`, `$2`): previenen inyección SQL.

### Códigos de error de auth

| Código | Cuándo | Mensaje |
|---|---|---|
| 401 | Falta el header `Authorization` | `No llegó ningún token en los headers` |
| 401 | Token vencido, mal firmado o mal formado | `Token inválido` |
| 403 | Token válido pero `rol` distinto de `'A'` | `No tenés permisos de administrador` |

## 8. Referencia de endpoints

| Método | Ruta | Auth | Rol | Body |
|---|---|---|---|---|
| POST | `/crearusuario` | No | — | `{ nombre, password }` |
| POST | `/login` | No | — | `{ nombre, password }` |
| POST | `/cancion` | Sí | Admin | `{ nombre }` |
| PUT | `/cancion` | Sí | Admin | `{ id, nombre }` |
| DELETE | `/cancion` | Sí | Admin | `{ id }` |
| POST | `/escucho` | Sí | Cualquiera | `{ id }` (id de la canción) |

Las rutas de canciones **no** usan `/:id` en la URL: el `id` viaja en el body, incluso en el DELETE.

### POST `/crearusuario`
- **201**: `{ "message": "Usuario creado!", "usuario": { "id", "nombre", "rol", "fan" } }`
- **400**: falta `nombre` o `password`.
- **500**: error de base (por ejemplo nombre duplicado).

### POST `/login`
- **200**: `{ "token": "..." }`
- **400**: faltan campos, usuario inexistente o clave incorrecta.
- **500**: error de base.

### POST `/cancion` (admin)
- **201**: `{ "message": "Canción creada!", "cancion": { "id", "nombre" } }`
- **400**: falta `nombre`. **401**/**403**: auth. **500**: error de base.

### PUT `/cancion` (admin)
- **200**: `{ "message": "Canción modificada!", "cancion": {...} }`
- **400**: falta `id` o `nombre`. **404**: la canción no existe. **401**/**403**/**500**.

### DELETE `/cancion` (admin)
- **200**: `{ "message": "Canción borrada!", "cancion": {...} }`
- **400**: falta `id`. **404**: no existe. **401**/**403**/**500**.

### POST `/escucho`
- **201**: `{ "message": "Escucha registrada!", "escucha": { "usuario_id", "cancion_id", "reproducciones" } }`
- **400**: falta `id`. **401**: sin token válido. **500**: por ejemplo canción inexistente (foreign key).

Hay ejemplos listos para Insomnia en `INSOMNIA.md`.

## 9. Explicación archivo por archivo

### `index.js`
```js
const app = express()
app.use(express.json())   // parsea bodies JSON a req.body
app.use(cors())           // permite llamadas desde cualquier origen
app.use(usuarioRoutes)
app.use(cancionRoutes)
app.use(escuchaRoutes)
export default app
```
- Crea y configura la aplicación, pero **no** la pone a escuchar: la línea `app.listen(...)` está comentada.
- Exportar `app` es lo que necesita Vercel, que la ejecuta como función serverless.
- El orden importa: `express.json()` va antes de las rutas para que `req.body` exista.

### `dbconfig.js`
Importa `dotenv/config` (carga el `.env`) y exporta el objeto de conexión con las variables `PG*`, puerto 5432 y SSL.

### `services/db.js`
Crea un único `Pool` de `pg` y lo exporta. El pool mantiene varias conexiones abiertas y las reutiliza, así que no hace falta `connect()` ni `end()` en cada consulta. Todos los services comparten este pool.

### `middlewares/auth.js`
- **`verifyToken(req, res, next)`**: lee `authorization`, separa por espacio y toma el token, llama a `jwt.verify`. Si es válido pone el payload en `req.user` y sigue; si no, responde 401.
- **`verifyAdmin(req, res, next)`**: requiere haber pasado antes por `verifyToken`. Si `req.user?.rol !== 'A'` responde 403.

### `routes/usuario.routes.js`
Dos rutas públicas: `/crearusuario` y `/login`.

### `routes/cancion.routes.js`
Tres rutas, todas con `verifyToken, verifyAdmin` en ese orden (primero autenticar, después autorizar).

### `routes/escucha.routes.js`
Una ruta con solo `verifyToken`: cualquier usuario logueado puede registrar escuchas.

### `controllers/usuario.controller.js`
- **`crearUsuario`**: valida campos, `bcrypt.hash(password, 10)` (10 rondas de sal), llama al service, responde 201.
- **`login`**: busca por nombre, compara hash, firma el JWT (`{ id, rol }`, 1 h) y lo devuelve.

### `controllers/cancion.controller.js`
Tres funciones con el mismo patrón: validar → llamar al service → si devuelve `undefined` responder 404 → si no, responder con la fila afectada. Todo dentro de `try/catch` que responde 500.

### `controllers/escucha.controller.js`
Contiene la regla de negocio más interesante:
```js
const CANCIONES_PARA_FAN = 10
const existente = await buscarEscucha(req.user.id, id)
const escucha = existente
  ? await incrementarEscucha(req.user.id, id)
  : await crearEscucha(req.user.id, id)
const cantidad = await contarCancionesEscuchadas(req.user.id)
if (cantidad > CANCIONES_PARA_FAN) await marcarFan(req.user.id)
```
Es decir: crear o incrementar, contar cuántas canciones distintas tiene el usuario y, si pasa el umbral, marcarlo como fan.

### `services/usuario.service.js`
- `crearUsuario(nombre, hashedPassword)`: insert con `returning` de las columnas seguras.
- `buscarPorNombre(nombre)`: `select *` (incluye el hash, necesario para el login).
- `marcarFan(usuarioId)`: `update ... set fan = true`.

### `services/cancion.service.js`
`crearCancion`, `modificarCancion`, `borrarCancion`. Los tres usan `returning *` y devuelven `rows[0]`: la fila afectada, o `undefined` si no hubo coincidencia.

### `services/escucha.service.js`
- `buscarEscucha`: busca la fila usuario+canción.
- `crearEscucha`: inserta con `reproducciones = 1`.
- `incrementarEscucha`: `reproducciones = reproducciones + 1`. La suma la hace la base, no el código.
- `contarCancionesEscuchadas`: `count(*)` de filas del usuario. Postgres devuelve el count como string, por eso se convierte con `Number(...)`.

## 10. Flujos completos de ejemplo

### Flujo de un usuario normal
1. `POST /crearusuario` → `{ nombre: "ana", password: "1234" }` → usuario con `rol: "U"`.
2. `POST /login` → recibe el token.
3. `POST /escucho` con `Authorization: Bearer <token>` y `{ id: 5 }` → `reproducciones: 1`.
4. Repetir con `{ id: 5 }` → `reproducciones: 2`.
5. Escuchar 11 canciones distintas → `fan` pasa a `true`.

### Flujo de un administrador
1. Se crea un usuario normal y se cambia su rol a mano en la base (`rol = 'A'`).
2. `POST /login` → el token ahora incluye `rol: "A"`. Si ya tenía un token viejo, hay que volver a loguearse: el rol viaja dentro del token.
3. `POST /cancion` → `{ nombre: "Bohemian Rhapsody" }`.
4. `PUT /cancion` → `{ id: 1, nombre: "Bohemian Rhapsody (Remastered)" }`.
5. `DELETE /cancion` → `{ id: 1 }`.

### Qué pasa si…
| Situación | Resultado |
|---|---|
| Usuario normal llama a `POST /cancion` | 403 |
| Se manda el token sin `Bearer ` | 401 `Token inválido` |
| Se escucha una canción que no existe | 500 por foreign key |
| Token de más de 1 hora | 401 `Token inválido` |
| Dos usuarios con el mismo nombre | 500 si la columna es `unique` |

## 11. Cómo ejecutarlo

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear las tablas en PostgreSQL (ver [sección 6](#6-modelo-de-datos)).
3. Crear el `.env` con las variables de la [sección 5](#5-configuración-y-variables-de-entorno).
4. Como `index.js` no levanta el servidor, para correr local hay dos opciones:
   - Descomentar la línea `app.listen(PORT, ...)` en `index.js`, o
   - Crear un `server.js` aparte:
     ```js
     import app from './index.js'
     app.listen(process.env.PORT || 3000, () => console.log('Local en http://localhost:3000'))
     ```
     y ejecutar `node server.js`.
5. Probar con Insomnia siguiendo `INSOMNIA.md`.

## 12. Despliegue en Vercel

Los commits "deploy vercel" y "fix bugs in app.js" muestran que el proyecto se despliega en Vercel. Vercel no ejecuta un proceso con `listen`: importa el `app` exportado y lo usa como handler serverless. Por eso `listen` está comentado.

Puntos a tener en cuenta:
- Las variables de entorno (`PG*`, `JWT_SECRET`) se cargan en el panel de Vercel, no en un `.env`.
- Al ser serverless, cada invocación puede crear su propio pool. En bases en la nube conviene usar el pooler de conexiones del proveedor.
- Por eso `ssl: true` es obligatorio.

## 13. Decisiones de diseño

| Decisión | Motivo |
|---|---|
| Capas routes / controllers / services | Separación de responsabilidades y código más fácil de mantener |
| `Pool` en lugar de `Client` | Reutiliza conexiones y simplifica el código |
| JWT en vez de sesiones | No hay que guardar estado en el servidor; encaja con serverless |
| Hash bcrypt con 10 rondas | Estándar razonable entre seguridad y velocidad |
| Rol dentro del token | Evita consultar la base en cada request para autorizar |
| `returning` en los SQL | Devuelve el resultado en la misma consulta, y su ausencia sirve para detectar el 404 |
| Usuario tomado del token | Impide suplantar a otro usuario en `/escucho` |
| Mensaje de login unificado | No revela qué usuarios existen |

## 14. Puntos débiles y mejoras sugeridas

### Seguridad
1. **Secreto JWT por defecto (`'secreto123'`)**. Si `JWT_SECRET` no está definido en producción, cualquiera puede firmar tokens válidos, incluso de administrador. *Mejora:* exigir la variable y fallar al arrancar si falta.
2. **El secreto está duplicado** en `auth.js` y `usuario.controller.js`. *Mejora:* centralizarlo en un único módulo de configuración.
3. **Errores internos expuestos**: `"Error ... en bd" + err` devuelve el mensaje de la base al cliente. *Mejora:* loguear el error y responder un mensaje genérico.
4. **Sin límite de intentos de login**. *Mejora:* `express-rate-limit`.
5. **`cors()` abierto a todos los orígenes**. *Mejora:* restringirlo a los dominios del frontend.
6. **Sin validación de contraseña** (longitud mínima, etc.) ni de tipos en el body.
7. **Token sin revocación**: un token robado es válido hasta que vence, y un cambio de rol no se refleja hasta el próximo login.

### Robustez
8. **Dependencia frágil de `dotenv`**: solo `dbconfig.js` lo importa. `auth.js` y `usuario.controller.js` leen `process.env.JWT_SECRET` y dependen de que `dbconfig.js` ya se haya cargado. Funciona por el orden de imports, pero conviene importar `dotenv/config` en `index.js`.
9. **Condición de carrera en `/escucho`**: buscar y luego crear o incrementar son pasos separados. Dos requests simultáneos de la misma canción podrían chocar con la clave primaria. *Mejora:*
   ```sql
   insert into escucha(usuario_id, cancion_id, reproducciones) values ($1,$2,1)
   on conflict (usuario_id, cancion_id)
   do update set reproducciones = escucha.reproducciones + 1
   returning *
   ```
   Esto reduce tres pasos a una sola consulta.
10. **Regla de "fan" con `>`**: marca fan a partir de la 11.ª canción distinta. Si la intención era 10, debería ser `>=`.
11. **`marcarFan` se ejecuta en cada escucha** una vez superado el umbral, aunque ya sea fan. Es inofensivo pero redundante.
12. **Borrar una canción con escuchas** puede fallar por la foreign key (error 500). *Mejora:* `on delete cascade` o un mensaje 409 claro.
13. **Un `id` no numérico** en el body produce un error de Postgres (500) en lugar de un 400.
14. **Sin endpoint para hacer admin a un usuario** ni para listar canciones o ver estadísticas.

### Calidad
15. **No hay tests** (el script `test` es el placeholder).
16. **No hay script SQL** versionado en el repo. *Mejora:* agregar `schema.sql`.
17. **No hay script `start`** en `package.json`.
18. **Hay un `console.log("escucha registrada", ...)`** de depuración en el controlador.

## 15. Historial del repositorio

Los commits, del más reciente al más antiguo:

| Commit | Mensaje |
|---|---|
| f06df6b | changes in services and new .md |
| 2f40d15 | imporve structure |
| 904e482 | fix id bug |
| 701a37d | finish |
| 4ff1ccd | fix bugs in app.js |
| 6f27689 | deploy vercel |
| 669577e | terminado |
| ecf88f5 | casi listo |
| 2705c15 | done7 |
| 187d946 | arreglado? |
| 6ad0f86 | :x |

El último commit ("imporve structure" y "changes in services") refleja la reestructuración a capas routes / controllers / services.
