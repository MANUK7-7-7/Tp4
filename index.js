import express from 'express'
import cors from 'cors'
import usuarioRoutes from './routes/usuario.routes.js'
import cancionRoutes from './routes/cancion.routes.js'
import "dotenv/config";
import { Cancion } from './models/cancion.js';
import { Usuario } from './models/usuario.js';
import { Escucha } from './models/escucha.js';
import { sequelize } from "./dbconfig.js";

const defineModels = async () => {
  Usuario.belongsToMany(Cancion, {through: Escucha});
  Cancion.belongsToMany(Usuario, {through: Escucha});
  await sequelize.sync({ force: false, alter: true });
}

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (_, res) => res.send("SpoTICfy API is running..."));
app.use("/auth", usuarioRoutes);
app.use("/cancion", cancionRoutes);
defineModels()


const server = app.listen(process.env.PORT || 3000, () =>
   console.log(`Server is running on port ${process.env.PORT || 3000}`)
);

// --- APAGADO LIMPIO (GRACEFUL SHUTDOWN) ---
async function shutdown() {
  console.log('\nIniciando apagado limpio...');
  server.close();
  await sequelize.close();
  console.log('Servidor y conexión a la base de datos cerrados. Saliendo del proceso...');
  process.exit(0);


}

// Escuchar señales de apagado (Ctrl+C en la terminal o reinicios de producción)
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

/*const app = express()
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

export default app */
