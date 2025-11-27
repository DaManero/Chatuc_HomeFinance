import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { categoryRouter } from "./routes/category.routes.js";
import { transactionRouter } from "./routes/transaction.routes.js";
import userRouter from "./routes/user.routes.js";
import recurringExpensesRouter from "./routes/recurringExpenses.routes.js";
import exchangeRateRouter from "./routes/exchangeRate.routes.js";
import loanRouter from "./routes/loan.routes.js";
import investmentRouter from "./routes/investment.routes.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/auth", authRouter);
  app.use("/categories", categoryRouter);
  app.use("/transactions", transactionRouter);
  app.use("/users", userRouter);
  app.use("/recurring-expenses", recurringExpensesRouter);
  app.use("/exchange-rates", exchangeRateRouter);
  app.use("/loans", loanRouter);
  app.use("/investments", investmentRouter);

  app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}
