import { verifyToken } from "../utils/jwt.js";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(403).json({ error: "Token inválido o expirado" });
  }

  // Agregar datos del usuario al request
  req.user = {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  };

  next();
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "No tienes permisos para esta acción" });
    }

    next();
  };
}
