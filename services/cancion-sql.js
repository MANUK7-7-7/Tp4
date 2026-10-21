import { Cancion } from '../models/cancion.js';
 import { Usuario } from '../models/usuario.js';
 import { Escucha } from '../models/escucha.js';
 
/*
 const amazing = await Cancion.create({ nombre: 'Amazing' });
 console.log(amazing instanceof Cancion); // true
 console.log(amazing.nombre);   // 'Amazing'
 amazing.nombre='Incredible'
 amazing.save() // Actualiza la instancia
 amazing.destroy() // Borra la instancia   
*/
const getCanciones = async (id) => {
    const usuario =await Usuario.findByPk(id, { include: Cancion } );
    if (!usuario) throw new Error("El usuario no existe");
    console.log("Usuario :",  JSON.stringify(usuario));
    console.log("Usuario canciones:",  JSON.stringify(usuario.cancions));
    return usuario.cancions;
};

const getCancionById = async (id) => {
    const a = await Cancion.findByPk(id);
    return a;
}

const escuchoCancion = async (cancion_id, usuario_id) => {

    const cancion =await getCancionById(cancion_id);
    if (!cancion) throw new Error("La cancion no existe");
    console.log("cancion encontrada", JSON.stringify(cancion));

    const usuario =await Usuario.findByPk(usuario_id);
    if (!usuario) throw new Error("El usuario no existe");

    console.log("Cancion usuarios:",  JSON.stringify(await cancion.getUsuarios()));
    await cancion.addUsuario(usuario, { through: { reproducciones: 1 } });
    await cancion.save();
};

const postCancion = async (cancion) => {
    const a = await Cancion.create(cancion);    
    return a;

}

const putCancion = async (id, nombre) => {
    const a = await Cancion.update({ 'nombre' :nombre}, { where: { id } });
    return a;
};

const deleteCancion = async (id) => {
    const a = await Cancion.destroy({ where: { id } });
    return a;
}

export default { getCanciones, postCancion, putCancion , deleteCancion, escuchoCancion };