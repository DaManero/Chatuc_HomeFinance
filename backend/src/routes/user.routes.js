import express from "express";
import {
  getUsers,
  updateUser,
  toggleUserStatus,
  deleteUser,
  createUser,
} from "../controllers/user.controller.js";
import {
  authenticateToken,
  requireRole,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Obtener todos los usuarios (cualquier usuario autenticado)
router.get("/", authenticateToken, getUsers);

// Crear usuario (solo Admin)
router.post("/", authenticateToken, requireRole("Admin"), createUser);

// Actualizar usuario (solo Admin)
router.put("/:id", authenticateToken, requireRole("Admin"), updateUser);

// Toggle estado activo/inactivo (solo Admin)
router.patch(
  "/:id/toggle-status",
  authenticateToken,
  requireRole("Admin"),
  toggleUserStatus
);

// Eliminar usuario (solo Admin)
router.delete("/:id", authenticateToken, requireRole("Admin"), deleteUser);

export default router;
