import { Router } from "express";
import { register, login, me, registerSchema, loginSchema } from "../controllers/auth.controller.js";
import { validar } from "../middleware/validar.js";
import { autenticar } from "../middleware/auth.js";

const router = Router();

router.post("/register", validar(registerSchema), register);
router.post("/login", validar(loginSchema), login);
router.get("/me", autenticar, me);

export default router;
