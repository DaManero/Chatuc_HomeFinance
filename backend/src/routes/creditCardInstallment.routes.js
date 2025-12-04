import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  getPendingInstallments,
  markInstallmentAsPaid,
} from "../controllers/creditCardInstallment.controller.js";

const router = express.Router();

router.get("/pending", authenticateToken, getPendingInstallments);
router.patch("/:id/mark-paid", authenticateToken, markInstallmentAsPaid);

export default router;
