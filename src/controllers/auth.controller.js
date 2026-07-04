import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../config/prisma.js";
import { firmarToken } from "../utils/jwt.js";
import { HttpError, asyncHandler } from "../utils/http.js";

export const registerSchema = z.object({
  nombre: z.string().min(2, "El nombre es muy corto").max(80),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  telefono: z.string().max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

// Quita el password antes de devolver el usuario
const sinPassword = ({ password, ...resto }) => resto;

// POST /api/auth/register  -> crea un usuario CLIENTE
export const register = asyncHandler(async (req, res) => {
  const { nombre, email, password, telefono } = req.body;

  const hash = await bcrypt.hash(password, 10);
  const usuario = await prisma.usuario.create({
    data: { nombre, email, password: hash, telefono, rol: "CLIENTE" },
  });

  const token = firmarToken({ id: usuario.id, rol: usuario.rol, email: usuario.email });
  res.status(201).json({ usuario: sinPassword(usuario), token });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) throw new HttpError(401, "Credenciales incorrectas.");

  const ok = await bcrypt.compare(password, usuario.password);
  if (!ok) throw new HttpError(401, "Credenciales incorrectas.");

  const token = firmarToken({ id: usuario.id, rol: usuario.rol, email: usuario.email });
  res.json({ usuario: sinPassword(usuario), token });
});

// GET /api/auth/me  -> usuario autenticado actual
export const me = asyncHandler(async (req, res) => {
  const usuario = await prisma.usuario.findUnique({ where: { id: req.user.id } });
  if (!usuario) throw new HttpError(404, "Usuario no encontrado.");
  res.json({ usuario: sinPassword(usuario) });
});
