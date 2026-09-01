import pkg from 'pg'
import dbconfig from './dbconfig.js'
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const { Client } = pkg;
const client = new Client(dbconfig)

await client.connect()

const app = express()
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || 'secreto123'


app.post('/crearusuario', async (req, res) => {
    const user = req.body;

    if (!user.userid || !user.email || !user.password) {
        return res.status(400).json({
            message: "Debe completar todos los campos"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        user.password = hashedPassword;
        let result = await client.query(
            "INSERT INTO usuario(id,email,password) VALUES ($1, $2, $3) RETURNING *",
            [user.userid, user.email, user.password]
        );

        console.log("Rows creadas:", result.rowCount);

        res.send(result.rows);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
})


app.post('/login', async (req, res) => {
    const user = req.body;

    if (!user.userid || !user.password) {
        return res.status(400).json({
            message: "Debe completar todos los campos"
        });
    }

    try {
        let result = await client.query(
            "select * from usuario where id=$1",
            [user.userid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        let dbUser = result.rows[0];

        const passOK = await bcrypt.compare(
            user.password,
            dbUser.password
        );

        if (passOK) {
            const payload = {
                id: dbUser.id
            }
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })

            res.send({
                token

            });
        } else {
            res.send("Clave inválida");
        }

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
})


app.post('/escucho', async (req, res) => {
    const token =
        req.headers.authorization?.replace('Bearer ', '') ||
        req.body.token

    try {
        const payload = jwt.verify(token, JWT_SECRET)

        const result = await client.query(
            `SELECT cancion.nombre, escucha.escuchas
             FROM escucha
             JOIN cancion ON cancion.id = escucha."cancionID"
             WHERE escucha."usuarioID" = $1`,
            [payload.id]
        )

        res.json(result.rows)

    } catch (err) {
        res.status(401).send("Token invalido")
    }
})


const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
    console.log(`Local en http://localhost:${PORT}`)
);

export default app;
