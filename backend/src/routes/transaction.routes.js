import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transaction.controller.js";

export const transactionRouter = Router();

// Todas las rutas requieren autenticación
transactionRouter.use(authenticateToken);

transactionRouter.post("/", createTransaction);
transactionRouter.get("/", getTransactions);
transactionRouter.put("/:id", updateTransaction);
transactionRouter.delete("/:id", deleteTransaction);
