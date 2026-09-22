import * as escuchaService from '../services/escucha.service.js'
import * as usuarioService from '../services/usuario.service.js'

const CANCIONES_PARA_FAN = 10

export async function registrarEscucha(req, res) {
  const { id } = req.body
  if (!id)
    return res.status(400).json({message:"Debes completar todos los campos"})

  try {
    const existente = await escuchaService.buscarEscucha(req.user.id, id)

    const escucha = existente
      ? await escuchaService.incrementarEscucha(req.user.id, id)
      : await escuchaService.crearEscucha(req.user.id, id)

    const cantidad = await escuchaService.contarCancionesEscuchadas(req.user.id)
    if (cantidad > CANCIONES_PARA_FAN)
      await usuarioService.marcarFan(req.user.id)

    console.log("escucha registrada", escucha)
    return res.status(201).json({message:"Escucha registrada!", escucha})
  }
  catch (err) {
    console.log("Error:", err)
    return res.status(500).json({message:"Error registrando escucha en bd" + err})
  }
}
