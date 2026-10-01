import * as escuchaService from '../services/escucha.service.js'
import * as usuarioService from '../services/usuario.service.js'

const REPRODUCCIONES_PARA_FAN = 10

export async function registrarEscucha(req, res) {
  const { id } = req.params

  try {
    const existente = await escuchaService.buscarEscucha(req.user.id, id)

    const escucha = existente
      ? await escuchaService.incrementarEscucha(req.user.id, id)
      : await escuchaService.crearEscucha(req.user.id, id)

    const cantidad = await escuchaService.contarReproducciones(req.user.id)
    if (cantidad >= REPRODUCCIONES_PARA_FAN)
      await usuarioService.marcarFan(req.user.id)

    console.log("escucha registrada", escucha)
    return res.status(201).json({message:"Escucha registrada!", escucha})
  }
  catch (err) {
    console.log("Error:", err)
    return res.status(500).json({message:"Error registrando escucha en bd" + err})
  }
}

export async function listarEscuchas(req, res) {
  try {
    const escuchas = await escuchaService.listarEscuchasDeUsuario(req.user.id)
    return res.status(200).json({escuchas})
  }
  catch (err) {
    console.log("Error:", err)
    return res.status(500).json({message:"Error leyendo escuchas en bd" + err})
  }
}
