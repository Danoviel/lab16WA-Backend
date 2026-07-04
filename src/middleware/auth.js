import { verificarToken } from "../utils/jwt.js";
import { HttpError } from "../utils/http.js";

// Exige un JWT válido en el header Authorization: Bearer <token>.
// Deja el payload del usuario en req.user = { id, rol, email }.
export function autenticar(req, _res, next) {
  const header = req.headers.authorization || "";
  const [tipo, token] = header.split(" ");

  if (tipo !== "Bearer" || !token) {
    return next(new HttpError(401, "No autenticado. Falta el token."));
  }

  try {
    req.user = verificarToken(token);
    next();
  } catch {
    next(new HttpError(401, "Token inválido o expirado."));
  }
}

// Restringe el acceso a los roles indicados. Uso: requireRole("ADMIN", "OPERADOR")
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new HttpError(401, "No autenticado."));
    if (!roles.includes(req.user.rol)) {
      return next(new HttpError(403, "No tienes permiso para esta acción."));
    }
    next();
  };
}
