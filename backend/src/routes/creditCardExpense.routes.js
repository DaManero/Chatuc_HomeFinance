import express from "express";
import {
  createCreditCardExpense,
  getCreditCardExpenses,
  updateCreditCardExpense,
  deleteCreditCardExpense,
  markInstallmentAsPaid,
} from "../controllers/creditCardExpense.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/", createCreditCardExpense);
router.get("/", getCreditCardExpenses);
router.put("/:id", updateCreditCardExpense);
router.delete("/:id", deleteCreditCardExpense);
router.patch("/installments/:id/pay", markInstallmentAsPaid);

export default router;
