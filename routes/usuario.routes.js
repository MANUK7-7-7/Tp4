import { Router } from 'express'
import * as usuarioController from '../controllers/usuario.controller.js'

const router = Router()

router.post('/crearusuario', usuarioController.crearUsuario)
router.post('/login', usuarioController.login)

export default router
