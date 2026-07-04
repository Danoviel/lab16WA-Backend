import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../config/prisma.js";
import { asyncHandler } from "../utils/http.js";

const selectSinPassword = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  telefono: true,
  createdAt: true,
};

export const crearUsuarioSchema = z.object({
  nombre: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6),
  rol: z.enum(["CLIENTE", "OPERADOR", "ADMIN"]).default("CLIENTE"),
  telefono: z.string().max(20).optional(),
});

export const actualizarUsuarioSchema = z.object({
  nombre: z.string().min(2).max(80).optional(),
  rol: z.enum(["CLIENTE", "OPERADOR", "ADMIN"]).optional(),
  telefono: z.string().max(20).optional(),
});

// GET /api/usuarios  (ADMIN)
export const listar = asyncHandler(async (_req, res) => {
  const usuarios = await prisma.usuario.findMany({
    select: selectSinPassword,
    orderBy: { id: "asc" },
  });
  res.json(usuarios);
});

// POST /api/usuarios  (ADMIN crea staff con rol asignado)
export const crear = asyncHandler(async (req, res) => {
  const { password, ...resto } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const usuario = await prisma.usuario.create({
    data: { ...resto, password: hash },
    select: selectSinPassword,
  });
  res.status(201).json(usuario);
});

// PUT /api/usuarios/:id  (ADMIN edita nombre/rol/telefono)
export const actualizar = asyncHandler(async (req, res) => {
  const usuario = await prisma.usuario.update({
    where: { id: Number(req.params.id) },
    data: req.body,
    select: selectSinPassword,
  });
  res.json(usuario);
});

// DELETE /api/usuarios/:id  (ADMIN)
export const eliminar = asyncHandler(async (req, res) => {
  await prisma.usuario.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});
