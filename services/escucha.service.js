import pool from './db.js'

export async function buscarEscucha(usuarioId, cancionId) {
  const result = await pool.query(
    "select * from escucha where usuario_id = $1 and cancion_id = $2",
    [usuarioId, cancionId]
  )
  return result.rows[0]
}

export async function crearEscucha(usuarioId, cancionId) {
  const result = await pool.query(
    "insert into escucha(usuario_id, cancion_id, reproducciones) values ($1,$2,1) returning *",
    [usuarioId, cancionId]
  )
  return result.rows[0]
}

export async function incrementarEscucha(usuarioId, cancionId) {
  const result = await pool.query(
    "update escucha set reproducciones = reproducciones + 1 where usuario_id = $1 and cancion_id = $2 returning *",
    [usuarioId, cancionId]
  )
  return result.rows[0]
}

export async function contarReproducciones(usuarioId) {
  const result = await pool.query(
    "select coalesce(sum(reproducciones), 0) as cantidad from escucha where usuario_id = $1",
    [usuarioId]
  )
  return Number(result.rows[0].cantidad)
}

export async function listarEscuchasDeUsuario(usuarioId) {
  const result = await pool.query(
    "select c.id, c.nombre, e.reproducciones from escucha e inner join cancion c on e.cancion_id = c.id where e.usuario_id = $1",
    [usuarioId]
  )
  return result.rows
}
