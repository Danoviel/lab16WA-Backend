import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import servicioRoutes from "./routes/servicio.routes.js";
import reservaRoutes from "./routes/reserva.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// CORS: si CORS_ORIGIN="*" refleja cualquier origen; si no, lista blanca (coma-separado).
const rawOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
const corsOrigin = rawOrigin.trim() === "*"
  ? true // refleja el origen de la petición (permite todos)
  : rawOrigin.split(",").map((o) => o.trim());
app.use(cors({ origin: corsOrigin, credentials: true }));

app.use(express.json());

// Healthcheck (útil para Railway y para probar que la API vive)
app.get("/", (_req, res) => res.json({ ok: true, servicio: "API Reservas", version: "1.0.0" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/servicios", servicioRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/usuarios", usuarioRoutes);

// 404 para rutas no definidas
app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada." }));

// Manejo central de errores (siempre al final)
app.use(errorHandler);

export default app;
