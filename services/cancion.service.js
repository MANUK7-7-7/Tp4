import pool from './db.js'

export async function crearCancion(nombre) {
  const result = await pool.query(
    "insert into cancion(nombre) values ($1) returning *",
    [nombre]
  )
  return result.rows[0]
}

export async function modificarCancion(id, nombre) {
  const result = await pool.query(
    "update cancion set nombre = $1 where id = $2 returning *",
    [nombre, id]
  )
  return result.rows[0]
}

export async function borrarCancion(id) {
  const result = await pool.query(
    "delete from cancion where id = $1 returning *",
    [id]
  )
  return result.rows[0]
}
