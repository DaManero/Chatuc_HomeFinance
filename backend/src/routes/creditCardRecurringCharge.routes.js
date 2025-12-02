import express from "express";
import {
  createRecurringCharge,
  getRecurringCharges,
  updateRecurringCharge,
  deleteRecurringCharge,
} from "../controllers/creditCardRecurringCharge.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/", createRecurringCharge);
router.get("/", getRecurringCharges);
router.put("/:id", updateRecurringCharge);
router.delete("/:id", deleteRecurringCharge);

export default router;
