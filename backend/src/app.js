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
import pendingTransactionRouter from "./routes/pendingTransaction.routes.js";
import { paymentMethodRouter } from "./routes/paymentMethod.routes.js";
import creditCardRouter from "./routes/creditCard.routes.js";
import creditCardExpenseRouter from "./routes/creditCardExpense.routes.js";
import creditCardRecurringChargeRouter from "./routes/creditCardRecurringCharge.routes.js";
import creditCardPaymentRouter from "./routes/creditCardPayment.routes.js";
import creditCardInstallmentRouter from "./routes/creditCardInstallment.routes.js";
import mortgageRouter from "./routes/mortgage.routes.js";

export function createApp() {
  const app = express();

  // Configuración de CORS mejorada
  const allowedOrigins = [
    "http://localhost:3001",
    "http://localhost:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3000",
    process.env.FRONTEND_URL,
    process.env.RENDER_EXTERNAL_URL,
  ].filter(Boolean);

  app.use(
    cors({
      origin: function (origin, callback) {
        // Permitir requests sin origin (como desde móviles o apps)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`CORS bloqueado para origen: ${origin}`);
          callback(null, true); // Permitir igual pero log para debugging
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
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
  app.use("/pending-transactions", pendingTransactionRouter);
  app.use("/payment-methods", paymentMethodRouter);
  app.use("/credit-cards", creditCardRouter);
  app.use("/credit-card-expenses", creditCardExpenseRouter);
  app.use("/credit-card-recurring-charges", creditCardRecurringChargeRouter);
  app.use("/credit-card-payments", creditCardPaymentRouter);
  app.use("/credit-card-installments", creditCardInstallmentRouter);
  app.use("/mortgage", mortgageRouter);

  app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}
