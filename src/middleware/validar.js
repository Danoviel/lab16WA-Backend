// Valida req.body contra un schema de Zod. Si falla, responde 400 con detalle.
export const validar = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errores = result.error.issues.map((i) => ({
      campo: i.path.join("."),
      mensaje: i.message,
    }));
    return res.status(400).json({ error: "Datos inválidos", detalles: errores });
  }
  req.body = result.data; // datos ya parseados/tipados
  next();
};
