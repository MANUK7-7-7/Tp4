import { Router } from 'express'
import * as cancionController from '../controllers/cancion.controller.js'
import { verifyToken, verifyAdmin } from '../middlewares/auth.js'

const router = Router()

router.post('/cancion', verifyToken, verifyAdmin, cancionController.crearCancion)
router.put('/cancion', verifyToken, verifyAdmin, cancionController.modificarCancion)
router.delete('/cancion', verifyToken, verifyAdmin, cancionController.borrarCancion)

export default router
