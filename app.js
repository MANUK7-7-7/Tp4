import pkg from 'pg'
import dbconfig from './dbconfig.js'
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const {Client} = pkg;
const client = new Client(dbconfig)
await client.connect()

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',  // Formato estándar para clave pública
    format: 'pem'  // Devuelve la clave como String PEM
  },
  privateKeyEncoding: {
    type: 'pkcs8', // Formato estándar para clave privada
    format: 'pem'  // Devuelve la clave como String PEM
  }
});

const app = express()
app.use(express.json())

// Recibe: userid nombre password
app.post('/crearusuario', async (req, res) => {
  const user = req.body; // si falla esto es porque falta app.use(express.json());
  if (!user.nombre || !user.userid || !user.password) {
    return res.status(400).json({ message: "Debe completar todos los campos" });
  }
  try {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    let result = await client.query("insert into usuario values ($1, $2, $3) returning *",
      [user.userid, user.nombre, user.password]);
    console.log("Rows creadas:", result.rowCount);
    res.send(result.rows)
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

// Recibe: userid password
app.post('/login', async (req, res) => {
  const user = req.body;
  if (!user.userid || !user.password) {
    return res.status(400).json({ message: "Debe completar todos los campos" });
  }
  try {
    let result = await client.query("select * from usuario where usuarioid=$1", [user.userid]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    let dbUser = result.rows[0];
    const passOK = await bcrypt.compare(user.password, dbUser.password);
    if (passOK) {
      const payload = {
        id: dbUser.usuarioid, role: 'user'
      };
      const token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '1h' })
      res.send({ token: token })
    } else {
      res.status(401).json({ message: "Clave invalida" })
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

// Recibe: Token
app.post('/escucho', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Debe enviar el token" });
  }
  try {
    const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    let result = await client.query(
      "select cancion.nombre, escucha.reproducciones from escucha " +
      "join cancion on cancion.cancionid = escucha.cancionid " +
      "where escucha.usuarioid=$1", [payload.id]);
    res.send(result.rows)
  } catch (error) {
    return res.status(401).json({ message: "Token invalido" });
  }
})

//const PORT = process.env.PORT || 3000;
//app.listen(PORT, () => {
//  console.log(`Local en http://localhost:${PORT}`);
//});

export default app;
