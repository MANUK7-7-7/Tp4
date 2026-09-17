import * as escuchaService from '../services/escucha.service.js'

export async function registrarEscucha(req, res) {
  const { id } = req.body
  if (!id)
    return res.status(400).json({message:"Debes completar todos los campos"})

  try {
    const escucha = await escuchaService.registrarEscucha(req.user.id, id)
    console.log("escucha registrada", escucha)
    return res.status(201).json({message:"Escucha registrada!", escucha})
  }
  catch (err) {
    console.log("Error:", err)
    return res.status(500).json({message:"Error registrando escucha en bd" + err})
  }
}
