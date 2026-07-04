import { Router } from "express";
import * as ctrl from "../controllers/reserva.controller.js";
import { crearReservaSchema, estadoSchema } from "../controllers/reserva.controller.js";
import { validar } from "../middleware/validar.js";
import { autenticar, requireRole } from "../middleware/auth.js";

const router = Router();

// Todas las rutas de reservas requieren sesión
router.use(autenticar);

router.get("/", ctrl.listar);
router.get("/:id", ctrl.obtener);
router.post("/", requireRole("CLIENTE", "ADMIN"), validar(crearReservaSchema), ctrl.crear);

router.patch("/:id/estado", requireRole("OPERADOR", "ADMIN"), validar(estadoSchema), ctrl.cambiarEstado);
router.patch("/:id/cancelar", ctrl.cancelar); // dueño o staff (validado en el controller)

router.delete("/:id", requireRole("ADMIN"), ctrl.eliminar);

export default router;
