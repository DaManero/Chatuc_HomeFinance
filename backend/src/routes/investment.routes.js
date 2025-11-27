import express from "express";
import {
  createInvestment,
  getInvestments,
  getInvestmentById,
  updateInvestment,
  deleteInvestment,
  registerEarning,
  getEarnings,
} from "../controllers/investment.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/", createInvestment);
router.get("/", getInvestments);
router.get("/:id", getInvestmentById);
router.put("/:id", updateInvestment);
router.delete("/:id", deleteInvestment);

// Rutas para rendimientos
router.post("/:id/earnings", registerEarning);
router.get("/:id/earnings", getEarnings);

export default router;
