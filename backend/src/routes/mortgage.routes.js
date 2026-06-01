import express from "express";
import {
  getMortgage,
  getInstallments,
  payInstallment,
  setupMortgage,
  getMortgageIncomeRatio,
} from "../controllers/mortgage.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", getMortgage);
router.get("/installments", getInstallments);
router.get("/income-ratio", getMortgageIncomeRatio);
router.post("/pay", payInstallment);
router.post("/setup", setupMortgage);

export default router;
