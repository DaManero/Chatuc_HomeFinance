import express from "express";
import {
  createCreditCard,
  getCreditCards,
  updateCreditCard,
  deleteCreditCard,
} from "../controllers/creditCard.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/", createCreditCard);
router.get("/", getCreditCards);
router.put("/:id", updateCreditCard);
router.delete("/:id", deleteCreditCard);

export default router;
