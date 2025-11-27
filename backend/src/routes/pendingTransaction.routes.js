import express from "express";
import {
  getPendingTransactions,
  createFromTelegram,
  processPendingTransaction,
  discardPendingTransaction,
  getPendingStats,
} from "../controllers/pendingTransaction.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Obtener transacciones pendientes
router.get("/", authenticateToken, getPendingTransactions);

// Obtener estadísticas
router.get("/stats", authenticateToken, getPendingStats);

// Crear desde Telegram (endpoint público con validación especial)
router.post("/from-telegram", createFromTelegram);

// Procesar una transacción pendiente
router.post("/:id/process", authenticateToken, processPendingTransaction);

// Descartar una transacción pendiente
router.delete("/:id", authenticateToken, discardPendingTransaction);

export default router;
