import express from 'express'
import cors from 'cors'
import usuarioRoutes from './routes/usuario.routes.js'
import cancionRoutes from './routes/cancion.routes.js'
import escuchaRoutes from './routes/escucha.routes.js'

const app = express()
app.use(express.json())
app.use(cors())

const PORT = process.env.PORT || 3000

app.use(usuarioRoutes)
app.use(cancionRoutes)
app.use(escuchaRoutes)

//app.listen(PORT, () => { console.log(`Local en http://localhost:${PORT}`);});

export default app
