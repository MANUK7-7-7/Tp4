import pool from './db.js'
import { marcarFan } from './usuario.service.js'

const CANCIONES_PARA_FAN = 10

export async function registrarEscucha(usuarioId, cancionId) {
  const existente = await pool.query(
    "select * from escucha where usuario_id = $1 and cancion_id = $2",
    [usuarioId, cancionId]
  )

  let escucha
  if (existente.rowCount > 0) {
    const result = await pool.query(
      "update escucha set reproducciones = reproducciones + 1 where usuario_id = $1 and cancion_id = $2 returning *",
      [usuarioId, cancionId]
    )
    escucha = result.rows[0]
  }
  else {
    const result = await pool.query(
      "insert into escucha(usuario_id, cancion_id, reproducciones) values ($1,$2,1) returning *",
      [usuarioId, cancionId]
    )
    escucha = result.rows[0]
  }

  const cantidad = await pool.query(
    "select count(*) from escucha where usuario_id = $1",
    [usuarioId]
  )

  if (Number(cantidad.rows[0].count) > CANCIONES_PARA_FAN)
    await marcarFan(usuarioId)

  return escucha
}
