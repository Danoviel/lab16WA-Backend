// Error HTTP con código de estado, para lanzar desde controllers/services
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Envuelve un handler async para que los errores caigan en el middleware de errores
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
