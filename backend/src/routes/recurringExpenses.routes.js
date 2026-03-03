import express from "express";
import {
  getRecurringProjection,
  getProjectionHistory,
} from "../controllers/recurringExpenses.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/projection", authenticateToken, getRecurringProjection);
router.get("/history", authenticateToken, getProjectionHistory);

export default router;
