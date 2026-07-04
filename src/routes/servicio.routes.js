import { Router } from "express";
import * as ctrl from "../controllers/servicio.controller.js";
import { servicioSchema } from "../controllers/servicio.controller.js";
import { validar } from "../middleware/validar.js";
import { autenticar, requireRole } from "../middleware/auth.js";

const router = Router();

// Lectura pública (para el catálogo del landing y el SEO)
router.get("/", ctrl.listar);
router.get("/:id", ctrl.obtener);

// Escritura solo ADMIN
router.post("/", autenticar, requireRole("ADMIN"), validar(servicioSchema), ctrl.crear);
router.put("/:id", autenticar, requireRole("ADMIN"), validar(servicioSchema), ctrl.actualizar);
router.delete("/:id", autenticar, requireRole("ADMIN"), ctrl.eliminar);

export default router;
