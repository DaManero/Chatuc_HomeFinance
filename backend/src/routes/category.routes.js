import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

export const categoryRouter = Router();

// Todas las rutas requieren autenticación
categoryRouter.use(authenticateToken);

categoryRouter.post("/", createCategory);
categoryRouter.get("/", getCategories);
categoryRouter.put("/:id", updateCategory);
categoryRouter.delete("/:id", deleteCategory);
