import { HttpError } from "../utils/http.js";

// Middleware final: traduce errores a respuestas JSON consistentes.
export function errorHandler(err, _req, res, _next) {
  // Errores controlados
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Violación de restricción única de Prisma (ej. email repetido)
  if (err.code === "P2002") {
    return res.status(409).json({ error: "Ya existe un registro con ese valor único." });
  }
  // Registro no encontrado
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Recurso no encontrado." });
  }

  console.error("[ERROR]", err);
  return res.status(500).json({ error: "Error interno del servidor." });
}
