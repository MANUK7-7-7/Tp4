import pkg from 'pg'
import dbconfig from '../dbconfig.js'

// Postgres Pool en vez de client, no necesita connect ni end
const { Pool } = pkg
const pool = new Pool(dbconfig)

export default pool
