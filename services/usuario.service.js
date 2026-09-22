import pool from './db.js'

export async function crearUsuario(nombre, hashedPassword) {
  const result = await pool.query(
    "insert into usuario(nombre, password) values ($1,$2) returning id, nombre, rol, fan",
    [nombre, hashedPassword]
  )
  return result.rows[0]
}

export async function buscarPorNombre(nombre) {
  const result = await pool.query(
    "select * from usuario where nombre = $1",
    [nombre]
  )
  return result.rows[0]
}

export async function marcarFan(usuarioId) {
  await pool.query(
    "update usuario set fan = true where id = $1",
    [usuarioId]
  )
}
