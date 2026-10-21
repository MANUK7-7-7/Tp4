import express from 'express'
import cors from 'cors'
import usuarioRoutes from './routes/usuario.routes.js'
import cancionRoutes from './routes/cancion.routes.js'
import dotenv from 'dotenv'
import "dotenv/config";
import { Cancion } from './models/cancion.js';
import { Usuario } from './models/usuario.js';
import { Escucha } from './models/escucha.js';
import { sequelize } from "./dbconfig.js";

const defineModels = async () => {
  Usuario.belongsToMany(Cancion, {through: Escucha});
  Cancion.belongsToMany(Usuario, {through: Escucha});
  await sequelize.sync({ force: false, alter: false });
}

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (_, res) => res.send("SpoTICfy API is running..."));
app.use("/auth", AuthRouter);
app.use("/cancion", CancionRouter);
defineModels()


app.listen(process.env.PORT || 3000, () =>
   console.log(`Server is running on port ${process.env.PORT || 3000}`)
);

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
