import express from "express";
import { getRecurringProjection } from "../controllers/recurringExpenses.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/projection", authenticateToken, getRecurringProjection);

export default router;
