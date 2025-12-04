import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { getStatistics } from "../controllers/statistics.controller.js";

export const statisticsRouter = Router();

// Todas las rutas requieren autenticación
statisticsRouter.use(authenticateToken);

statisticsRouter.get("/", getStatistics);
