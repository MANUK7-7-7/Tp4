import { Escucha } from '../models/escucha.js';
import { Usuario } from '../models/usuario.js';
import { Cancion } from '../models/cancion.js';

const buscarEscucha = async (usuarioId, cancionId) => {
    const e = await Escucha.findOne({ where: { usuarioId, cancionId } });
    return e;
};

const crearEscucha = async (usuarioId, cancionId) => {
    const e = await Escucha.create({ usuarioId, cancionId, reproducciones: 1 });
    return e;
};

const incrementarEscucha = async (usuarioId, cancionId) => {
    const e = await buscarEscucha(usuarioId, cancionId);
    if (!e) return null;
    await e.increment('reproducciones');
    await e.reload();
    return e;
};

const contarReproducciones = async (usuarioId) => {
    const total = await Escucha.sum('reproducciones', { where: { usuarioId } });
    return Number(total) || 0;
};

const listarEscuchasDeUsuario = async (usuarioId) => {
    const usuario = await Usuario.findByPk(usuarioId, { include: Cancion });
    if (!usuario) return [];
    return usuario.cancions.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        reproducciones: c.escucha.reproducciones
    }));
};

export default { buscarEscucha, crearEscucha, incrementarEscucha, contarReproducciones, listarEscuchasDeUsuario };
