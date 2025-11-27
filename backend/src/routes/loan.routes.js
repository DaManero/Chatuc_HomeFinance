import express from "express";
import {
  createLoan,
  getLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
  registerPayment,
} from "../controllers/loan.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticateToken, createLoan);
router.get("/", authenticateToken, getLoans);
router.get("/:id", authenticateToken, getLoanById);
router.put("/:id", authenticateToken, updateLoan);
router.delete("/:id", authenticateToken, deleteLoan);
router.post("/:id/payments", authenticateToken, registerPayment);

export default router;
