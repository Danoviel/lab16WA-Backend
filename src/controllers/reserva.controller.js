import { z } from "zod";
import prisma from "../config/prisma.js";
import { HttpError, asyncHandler } from "../utils/http.js";

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/; // HH:MM 24h

export const crearReservaSchema = z
  .object({
    servicioId: z.coerce.number().int().positive(),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha debe ser YYYY-MM-DD"),
    horaInicio: z.string().regex(horaRegex, "Hora inicio inválida (HH:MM)"),
    horaFin: z.string().regex(horaRegex, "Hora fin inválida (HH:MM)"),
    notas: z.string().max(300).optional(),
  })
  .refine((d) => d.horaFin > d.horaInicio, {
    message: "La hora fin debe ser posterior a la hora inicio",
    path: ["horaFin"],
  });

export const estadoSchema = z.object({
  estado: z.enum(["PENDIENTE", "CONFIRMADA", "CANCELADA"]),
});

const incluirRelaciones = {
  servicio: { select: { id: true, nombre: true, tipo: true, precioHora: true } },
  usuario: { select: { id: true, nombre: true, email: true } },
};

// Dos rangos [aIni,aFin) y [bIni,bFin) se solapan si aIni < bFin && bIni < aFin
async function haySolapamiento(servicioId, fecha, horaInicio, horaFin, ignorarId = null) {
  const delDia = await prisma.reserva.findMany({
    where: {
      servicioId,
      fecha: new Date(fecha),
      estado: { not: "CANCELADA" },
      ...(ignorarId ? { id: { not: ignorarId } } : {}),
    },
    select: { horaInicio: true, horaFin: true },
  });
  return delDia.some((r) => horaInicio < r.horaFin && r.horaInicio < horaFin);
}

// GET /api/reservas
// Cliente -> solo las suyas. Operador/Admin -> todas (con filtros ?estado= ?servicioId=)
export const listar = asyncHandler(async (req, res) => {
  const esStaff = req.user.rol === "ADMIN" || req.user.rol === "OPERADOR";
  const { estado, servicioId } = req.query;

  const reservas = await prisma.reserva.findMany({
    where: {
      ...(esStaff ? {} : { usuarioId: req.user.id }),
      ...(estado ? { estado } : {}),
      ...(servicioId ? { servicioId: Number(servicioId) } : {}),
    },
    include: incluirRelaciones,
    orderBy: [{ fecha: "desc" }, { horaInicio: "asc" }],
  });
  res.json(reservas);
});

// GET /api/reservas/:id  (dueño o staff)
export const obtener = asyncHandler(async (req, res) => {
  const reserva = await prisma.reserva.findUniqueOrThrow({
    where: { id: Number(req.params.id) },
    include: incluirRelaciones,
  });
  const esStaff = req.user.rol === "ADMIN" || req.user.rol === "OPERADOR";
  if (!esStaff && reserva.usuarioId !== req.user.id) {
    throw new HttpError(403, "No puedes ver esta reserva.");
  }
  res.json(reserva);
});

// POST /api/reservas  (CLIENTE crea para sí mismo)
export const crear = asyncHandler(async (req, res) => {
  const { servicioId, fecha, horaInicio, horaFin, notas } = req.body;

  const servicio = await prisma.servicio.findUnique({ where: { id: servicioId } });
  if (!servicio || !servicio.activo) {
    throw new HttpError(400, "La cancha no existe o no está disponible.");
  }

  if (await haySolapamiento(servicioId, fecha, horaInicio, horaFin)) {
    throw new HttpError(409, "Ese horario ya está reservado para esta cancha.");
  }

  const reserva = await prisma.reserva.create({
    data: {
      usuarioId: req.user.id,
      servicioId,
      fecha: new Date(fecha),
      horaInicio,
      horaFin,
      notas,
      estado: "PENDIENTE",
    },
    include: incluirRelaciones,
  });
  res.status(201).json(reserva);
});

// PATCH /api/reservas/:id/estado  (OPERADOR/ADMIN confirman o cancelan)
export const cambiarEstado = asyncHandler(async (req, res) => {
  const reserva = await prisma.reserva.update({
    where: { id: Number(req.params.id) },
    data: { estado: req.body.estado },
    include: incluirRelaciones,
  });
  res.json(reserva);
});

// PATCH /api/reservas/:id/cancelar  (el dueño cancela la suya)
export const cancelar = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const reserva = await prisma.reserva.findUniqueOrThrow({ where: { id } });

  const esStaff = req.user.rol === "ADMIN" || req.user.rol === "OPERADOR";
  if (!esStaff && reserva.usuarioId !== req.user.id) {
    throw new HttpError(403, "No puedes cancelar esta reserva.");
  }
  if (reserva.estado === "CANCELADA") {
    throw new HttpError(400, "La reserva ya está cancelada.");
  }

  const actualizada = await prisma.reserva.update({
    where: { id },
    data: { estado: "CANCELADA" },
    include: incluirRelaciones,
  });
  res.json(actualizada);
});

// DELETE /api/reservas/:id  (ADMIN)
export const eliminar = asyncHandler(async (req, res) => {
  await prisma.reserva.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});
