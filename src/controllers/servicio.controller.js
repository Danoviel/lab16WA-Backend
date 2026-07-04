import { z } from "zod";
import prisma from "../config/prisma.js";
import { asyncHandler } from "../utils/http.js";

export const servicioSchema = z.object({
  nombre: z.string().min(2).max(100),
  descripcion: z.string().max(500).optional(),
  tipo: z.string().min(2).max(40),
  precioHora: z.coerce.number().positive("El precio debe ser mayor a 0"),
  capacidad: z.coerce.number().int().positive().default(1),
  imagenUrl: z.string().url("URL de imagen inválida").optional().or(z.literal("")),
  activo: z.boolean().default(true),
});

// GET /api/servicios  (público) — lista canchas, filtro opcional ?tipo= y ?activo=
export const listar = asyncHandler(async (req, res) => {
  const { tipo, activo } = req.query;
  const servicios = await prisma.servicio.findMany({
    where: {
      ...(tipo ? { tipo } : {}),
      ...(activo !== undefined ? { activo: activo === "true" } : {}),
    },
    orderBy: { id: "asc" },
  });
  res.json(servicios);
});

// GET /api/servicios/:id  (público)
export const obtener = asyncHandler(async (req, res) => {
  const servicio = await prisma.servicio.findUniqueOrThrow({
    where: { id: Number(req.params.id) },
  });
  res.json(servicio);
});

// POST /api/servicios  (ADMIN)
export const crear = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.imagenUrl === "") data.imagenUrl = null;
  const servicio = await prisma.servicio.create({ data });
  res.status(201).json(servicio);
});

// PUT /api/servicios/:id  (ADMIN)
export const actualizar = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.imagenUrl === "") data.imagenUrl = null;
  const servicio = await prisma.servicio.update({
    where: { id: Number(req.params.id) },
    data,
  });
  res.json(servicio);
});

// DELETE /api/servicios/:id  (ADMIN)
export const eliminar = asyncHandler(async (req, res) => {
  await prisma.servicio.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});
