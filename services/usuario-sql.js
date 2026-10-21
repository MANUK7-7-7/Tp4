import pkg from 'pg'
const {Client} = pkg;
import { config } from "../dbconfig.js";

import { Usuario } from '../models/usuario.js';


const getUsuarioById = async (id) => {
        const u = Usuario.findByPk(id);
        if (!u) return null;
        return u;
 
};

const createUsuario = async (usuario) => {
        const u = await Usuario.create(usuario);    
        return u;
 
}
 
/*
const createUsuario = async (usuario) => {
    const client = new Client(config);
    await client.connect();

    try {
        const { rows } = await client.query(
            "INSERT INTO usuario (userid, nombre, password, admin) VALUES ($1, $2, $3, false)",
            [usuario.userid, usuario.nombre, usuario.password]
        );

        await client.end();
        return rows;
    } catch (error) {
        await client.end();
        throw error;
    }
};
*/
export default { getUsuarioById, createUsuario };