import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import usuarioService from '../services/usuario-sql.js'

const JWT_SECRET = process.env.JWT_SECRET || 'secreto123'

export async function crearUsuario(req, res) {
  const user = req.body
  if (!user.nombre || !user.password)
    return res.status(400).json({message:"Debes completar todos los campos"})

  try {
    const hashedPwd = await bcrypt.hash(user.password, 10)
    const nuevoUsuario = await usuarioService.crearUsuario({
      userid: user.userid ?? user.nombre,
      nombre: user.nombre,
      password: hashedPwd
    })
    console.log("usuario creado", nuevoUsuario)
    const { password, ...usuario } = nuevoUsuario.toJSON()
    return res.status(201).json({message:"Usuario creado!", usuario})
  }
  catch (err) {
    console.log("Error:", err)
    return res.status(500).json({message:"Error creando usuario en bd" + err})
  }
}

export async function login(req, res) {
  const user = req.body
  if (!user.nombre || !user.password)
    return res.status(400).json({message:"Debes completar todos los campos"})

  try {
    const dbUser = await usuarioService.buscarPorNombre(user.nombre)
    if (!dbUser)
      return res.status(400).json({message:"Usuario inexistente o clave incorrecta"})

    const passOK = await bcrypt.compare(user.password, dbUser.password)
    if (!passOK)
      return res.status(400).json({message:"Usuario inexistente o clave incorrecta"})

    const payload = { id: dbUser.id, admin: dbUser.admin }
    const token = jwt.sign(payload, JWT_SECRET, {expiresIn:'1h'})
    return res.status(200).json({token})
  }
  catch (err) {
    console.log("Error:", err)
    return res.status(500).json({message:"Error accediendo a bd" + err})
  }
}
