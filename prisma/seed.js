import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Limpiando datos previos...");
  await prisma.reserva.deleteMany();
  await prisma.servicio.deleteMany();
  await prisma.usuario.deleteMany();

  const hash = (p) => bcrypt.hashSync(p, 10);

  console.log("👤 Creando usuarios...");
  const admin = await prisma.usuario.create({
    data: { nombre: "Administrador", email: "admin@reservas.com", password: hash("admin123"), rol: "ADMIN", telefono: "999111222" },
  });
  const operador = await prisma.usuario.create({
    data: { nombre: "Operador Cancha", email: "operador@reservas.com", password: hash("operador123"), rol: "OPERADOR", telefono: "999333444" },
  });
  const cliente = await prisma.usuario.create({
    data: { nombre: "David Carhuaz", email: "cliente@reservas.com", password: hash("cliente123"), rol: "CLIENTE", telefono: "999555666" },
  });

  console.log("⚽ Creando canchas...");
  const canchas = await prisma.servicio.createManyAndReturn({
    data: [
      { nombre: "Cancha de Fútbol 7 - Grass Sintético", descripcion: "Cancha techada con grass sintético profesional e iluminación LED.", tipo: "futbol", precioHora: 80.0, capacidad: 14, imagenUrl: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800" },
      { nombre: "Cancha de Vóley Playa", descripcion: "Cancha de arena reglamentaria para vóley playa 2v2 o 4v4.", tipo: "voley", precioHora: 45.0, capacidad: 8, imagenUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800" },
      { nombre: "Cancha de Básquet Techada", descripcion: "Losa de básquet techada con tableros profesionales.", tipo: "basquet", precioHora: 60.0, capacidad: 10, imagenUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800" },
      { nombre: "Cancha de Tenis - Arcilla", descripcion: "Cancha de tenis de arcilla con red profesional.", tipo: "tenis", precioHora: 55.0, capacidad: 4, imagenUrl: "https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=800" },
      { nombre: "Cancha de Fútbol 5 - Losa", descripcion: "Losa deportiva ideal para fulbito rápido entre amigos.", tipo: "futbol", precioHora: 50.0, capacidad: 10, imagenUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800" },
    ],
  });

  console.log("📅 Creando reservas de ejemplo...");
  const hoy = new Date();
  const enDias = (n) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() + n);
    return new Date(d.toISOString().slice(0, 10));
  };

  await prisma.reserva.createMany({
    data: [
      { usuarioId: cliente.id, servicioId: canchas[0].id, fecha: enDias(1), horaInicio: "18:00", horaFin: "19:00", estado: "CONFIRMADA", notas: "Partido con amigos" },
      { usuarioId: cliente.id, servicioId: canchas[2].id, fecha: enDias(2), horaInicio: "20:00", horaFin: "21:00", estado: "PENDIENTE" },
      { usuarioId: cliente.id, servicioId: canchas[1].id, fecha: enDias(-3), horaInicio: "10:00", horaFin: "11:00", estado: "CONFIRMADA", notas: "Vóley del finde" },
    ],
  });

  console.log("\n✅ Seed completado. Credenciales de prueba:");
  console.table([
    { rol: "ADMIN", email: admin.email, password: "admin123" },
    { rol: "OPERADOR", email: operador.email, password: "operador123" },
    { rol: "CLIENTE", email: cliente.email, password: "cliente123" },
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
