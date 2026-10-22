import { Router } from 'express'
import * as cancionController from '../controllers/cancion.controller.js'
import * as escuchaController from '../controllers/escucha.controller.js'
import { verifyToken, verifyAdmin } from '../middlewares/auth.js'

const router = Router()

router.get('/escucho', verifyToken, escuchaController.listarEscuchas)
router.post('/escucho/:id', verifyToken, escuchaController.registrarEscucha)
router.get('/:id', verifyToken, cancionController.buscarCancion)
router.get('/', verifyToken, cancionController.listarCanciones)
router.put('/:id', verifyToken, verifyAdmin, cancionController.modificarCancion)
router.post('/', verifyToken, verifyAdmin, cancionController.crearCancion)
router.delete('/:id', verifyToken, verifyAdmin, cancionController.borrarCancion)

export default router

/* 
import Router from "express";
import CancionController from "../controllers/cancion.js";
import { verifyToken, verifyAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/", verifyToken,CancionController.getCanciones);
router.post("/escucho", verifyToken,CancionController.escuchoCancion);
router.post("/", verifyToken, verifyAdmin, CancionController.postCancion);
router.put("/:id", verifyToken, verifyAdmin, CancionController.putCancion);
router.delete("/:id", verifyToken, verifyAdmin, CancionController.deleteCancion);

export default router; lean
*/
