import * as cancionService from '../services/cancion.service.js'

export async function crearCancion(req, res) {
  const { nombre } = req.body
  if (!nombre)
    return res.status(400).json({message:"Debes completar todos los campos"})

  try {
    const cancion = await cancionService.crearCancion(nombre)
    return res.status(201).json({message:"Canción creada!", cancion})
  }
  catch (err) {
    console.log("Error:", err)
    return res.status(500).json({message:"Error creando cancion en bd" + err})
  }
}

export async function modificarCancion(req, res) {
  const { id, nombre } = req.body
  if (!id || !nombre)
    return res.status(400).json({message:"Debes completar todos los campos"})

  try {
    const cancion = await cancionService.modificarCancion(id, nombre)
    if (!cancion)
      return res.status(404).json({message:"Canción inexistente"})

    return res.status(200).json({message:"Canción modificada!", cancion})
  }
  catch (err) {
    console.log("Error:", err)
    return res.status(500).json({message:"Error modificando cancion en bd" + err})
  }
}

export async function borrarCancion(req, res) {
  const { id } = req.body
  if (!id)
    return res.status(400).json({message:"Debes completar todos los campos"})

  try {
    const cancion = await cancionService.borrarCancion(id)
    if (!cancion)
      return res.status(404).json({message:"Canción inexistente"})

    return res.status(200).json({message:"Canción borrada!", cancion})
  }
  catch (err) {
    console.log("Error:", err)
    return res.status(500).json({message:"Error borrando cancion en bd" + err})
  }
}
