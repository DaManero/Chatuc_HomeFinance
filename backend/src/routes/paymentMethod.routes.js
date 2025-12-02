import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  createPaymentMethod,
  getPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod,
} from "../controllers/paymentMethod.controller.js";

export const paymentMethodRouter = Router();

// Todas las rutas requieren autenticación
paymentMethodRouter.use(authenticateToken);

paymentMethodRouter.post("/", createPaymentMethod);
paymentMethodRouter.get("/", getPaymentMethods);
paymentMethodRouter.put("/:id", updatePaymentMethod);
paymentMethodRouter.delete("/:id", deletePaymentMethod);
