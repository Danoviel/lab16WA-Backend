import { Router } from "express";
import * as ctrl from "../controllers/usuario.controller.js";
import { crearUsuarioSchema, actualizarUsuarioSchema } from "../controllers/usuario.controller.js";
import { validar } from "../middleware/validar.js";
import { autenticar, requireRole } from "../middleware/auth.js";

const router = Router();

// Toda la gestión de usuarios es solo para ADMIN
router.use(autenticar, requireRole("ADMIN"));

router.get("/", ctrl.listar);
router.post("/", validar(crearUsuarioSchema), ctrl.crear);
router.put("/:id", validar(actualizarUsuarioSchema), ctrl.actualizar);
router.delete("/:id", ctrl.eliminar);

export default router;
