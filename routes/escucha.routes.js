import { Router } from 'express'
import * as escuchaController from '../controllers/escucha.controller.js'
import { verifyToken } from '../middlewares/auth.js'

const router = Router()

router.post('/escucho', verifyToken, escuchaController.registrarEscucha)

export default router
