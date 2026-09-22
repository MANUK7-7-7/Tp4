# Guía de Insomnia — API TP4

Cómo cargar cada endpoint en Insomnia: método, URL, headers y body.

## Configuración base

- **Base URL local:** `http://localhost:3000`
- En todos los requests con body, el **Body** se carga como **JSON** (en Insomnia: `Body` → `JSON`). Eso ya manda el header `Content-Type: application/json`, no hace falta agregarlo a mano.
- Los endpoints protegidos necesitan el header `Authorization` con el token que devuelve `/login`:

  ```
  Authorization: Bearer <token>
  ```

  Conviene crear un Environment en Insomnia con una variable `base_url` y otra `token`, y usar `{{ base_url }}` y `Bearer {{ token }}`.

### Resumen de endpoints

| Método | Ruta | Auth | Rol requerido |
|--------|------|------|---------------|
| POST | `/crearusuario` | No | — |
| POST | `/login` | No | — |
| POST | `/cancion` | Sí | Admin (`rol = 'A'`) |
| PUT | `/cancion` | Sí | Admin (`rol = 'A'`) |
| DELETE | `/cancion` | Sí | Admin (`rol = 'A'`) |
| POST | `/escucho` | Sí | Cualquier usuario logueado |

---

## 1. Crear usuario

Crea un usuario nuevo. La password se guarda hasheada con bcrypt. El usuario se crea con el `rol` por defecto de la base (no se puede elegir desde acá).

- **Método:** `POST`
- **URL:** `http://localhost:3000/crearusuario`
- **Headers:** ninguno extra (solo el `Content-Type: application/json` que pone Insomnia al elegir Body → JSON)
- **Body (JSON):**

```json
{
  "nombre": "axel",
  "password": "1234"
}
```

**Respuesta 201:**

```json
{
  "message": "Usuario creado!",
  "usuario": { "id": 1, "nombre": "axel", "rol": "U", "fan": false }
}
```

**Errores:** `400` si falta `nombre` o `password`; `500` si falla la base (por ejemplo, nombre repetido).

---

## 2. Login

Devuelve el JWT que hay que usar en el resto de los endpoints. El token dura **1 hora**.

- **Método:** `POST`
- **URL:** `http://localhost:3000/login`
- **Headers:** ninguno extra
- **Body (JSON):**

```json
{
  "nombre": "axel",
  "password": "1234"
}
```

**Respuesta 200:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Copiá ese `token` y pegalo en la variable `token` del Environment, así el resto de los requests lo toman solos.

**Errores:** `400` si faltan campos o si el usuario/clave no coinciden; `500` si falla la base.

---

## 3. Crear canción

Solo admin.

- **Método:** `POST`
- **URL:** `http://localhost:3000/cancion`
- **Headers:**

  ```
  Authorization: Bearer {{ token }}
  ```

- **Body (JSON):**

```json
{
  "nombre": "Bohemian Rhapsody"
}
```

**Respuesta 201:**

```json
{
  "message": "Canción creada!",
  "cancion": { "id": 1, "nombre": "Bohemian Rhapsody" }
}
```

**Errores:** `400` si falta `nombre`; `401` si no mandás token o está vencido/inválido; `403` si el usuario no es admin; `500` si falla la base.

---

## 4. Modificar canción

Solo admin. El `id` va **en el body**, no en la URL.

- **Método:** `PUT`
- **URL:** `http://localhost:3000/cancion`
- **Headers:**

  ```
  Authorization: Bearer {{ token }}
  ```

- **Body (JSON):**

```json
{
  "id": 1,
  "nombre": "Bohemian Rhapsody (Remastered)"
}
```

**Respuesta 200:**

```json
{
  "message": "Canción modificada!",
  "cancion": { "id": 1, "nombre": "Bohemian Rhapsody (Remastered)" }
}
```

**Errores:** `400` si falta `id` o `nombre`; `401` sin token válido; `403` si no es admin; `404` si la canción no existe; `500` si falla la base.

---

## 5. Borrar canción

Solo admin. El `id` también va **en el body** — en Insomnia un `DELETE` acepta body igual que un POST, se carga en la pestaña Body → JSON.

- **Método:** `DELETE`
- **URL:** `http://localhost:3000/cancion`
- **Headers:**

  ```
  Authorization: Bearer {{ token }}
  ```

- **Body (JSON):**

```json
{
  "id": 1
}
```

**Respuesta 200:**

```json
{
  "message": "Canción borrada!",
  "cancion": { "id": 1, "nombre": "Bohemian Rhapsody (Remastered)" }
}
```

**Errores:** `400` si falta `id`; `401` sin token válido; `403` si no es admin; `404` si la canción no existe; `500` si falla la base.

---

## 6. Registrar escucha

Registra que el usuario del token escuchó una canción. Si ya la había escuchado, suma una reproducción. El usuario se toma del token, así que **no se manda el id de usuario en el body**: el `id` del body es el de la **canción**.

Cuando el usuario supera las 10 canciones distintas escuchadas, queda marcado como `fan`.

- **Método:** `POST`
- **URL:** `http://localhost:3000/escucho`
- **Headers:**

  ```
  Authorization: Bearer {{ token }}
  ```

- **Body (JSON):**

```json
{
  "id": 1
}
```

**Respuesta 201:**

```json
{
  "message": "Escucha registrada!",
  "escucha": { "usuario_id": 1, "cancion_id": 1, "reproducciones": 1 }
}
```

**Errores:** `400` si falta `id`; `401` sin token válido; `500` si falla la base (por ejemplo, si la canción no existe y salta la foreign key).

---

## Notas sobre los errores de auth

| Código | Cuándo pasa | Mensaje |
|--------|-------------|---------|
| `401` | No mandaste el header `Authorization` | `No llegó ningún token en los headers` |
| `401` | El token está vencido o mal formado | `Token inválido` |
| `403` | El token es válido pero el usuario no es admin | `No tenés permisos de administrador` |

El header tiene que tener el formato `Bearer <token>` — el middleware parte el string por el espacio y toma la segunda parte, así que si mandás el token pelado no funciona.
