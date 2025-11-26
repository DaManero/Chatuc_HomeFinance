import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", authenticateToken, getMe);
