import express from "express";
import {
  getCurrentRate,
  updateRate,
  getRateHistory,
} from "../controllers/exchangeRate.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/current", authenticateToken, getCurrentRate);
router.post("/update", authenticateToken, updateRate);
router.get("/history", authenticateToken, getRateHistory);

export default router;
