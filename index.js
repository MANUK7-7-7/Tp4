import express from 'express'
import cors from 'cors'
import usuarioRoutes from './routes/usuario.routes.js'
import cancionRoutes from './routes/cancion.routes.js'

const app = express()
app.use(express.json())
app.use(cors())

const PORT = process.env.PORT || 3000

app.use('/auth', usuarioRoutes)
app.use('/cancion', cancionRoutes)

app.use((req, res) => {
  res.status(404).json({
    Error: "unknown endpoint",
    IP: req.ip,
    Method: req.method,
    Path: req.path,
    Query: req.query,
    Body: req.body
  })
})

app.listen(PORT, () => { console.log(`Local en http://localhost:${PORT}`);});

export default app
