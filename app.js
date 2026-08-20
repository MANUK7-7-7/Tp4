import pkg from 'pg'
import dbconfig from './dbconfig.js'
import express from 'express'

const {Client} = pkg;
const client = new Client(dbconfig)
await client.connect()

const result = await client.query("SELECT * FROM usuario order by id")
console.log(result.rows)
const usuario1 = result.rows[0].nombre
console.log("usuario1:",usuario1)

await client.end()

const app = express()
//const port = 3000;
app.get('/',(req,res)=>res.send("Welcome " + usuario1 ))
//const PORT = process.env.PORT || 3000;
//app.listen(PORT, () => {
// /console.log(`Local en http://localhost:${PORT}`);
//});
export default app;