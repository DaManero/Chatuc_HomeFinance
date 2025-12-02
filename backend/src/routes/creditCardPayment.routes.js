import express from "express";
import {
  getProjections,
  createCreditCardPayment,
  getCreditCardPayments,
  deleteCreditCardPayment,
  getCreditCardSummary,
} from "../controllers/creditCardPayment.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/projections", getProjections);
router.post("/payments", createCreditCardPayment);
router.get("/payments", getCreditCardPayments);
router.delete("/payments/:id", deleteCreditCardPayment);
router.get("/:id/summary", getCreditCardSummary);

export default router;
