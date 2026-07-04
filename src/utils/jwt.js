import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Genera un token firmado con el id y rol del usuario
export function firmarToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

// Verifica y decodifica un token; lanza si es inválido/expirado
export function verificarToken(token) {
  return jwt.verify(token, SECRET);
}
