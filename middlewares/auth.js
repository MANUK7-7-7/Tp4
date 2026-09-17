import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secreto123'

export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader)
    return res.status(401).json({message:"No llegó ningún token en los headers"})

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  }
  catch (err) {
    console.log("Error:", err)
    return res.status(401).json({message:"Token inválido"})
  }
}

export function verifyAdmin(req, res, next) {
  if (req.user?.rol !== 'A')
    return res.status(403).json({message:"No tenés permisos de administrador"})

  next()
}
