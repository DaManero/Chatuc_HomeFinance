import { sequelize } from "../config/db.js";
import { User } from "./user.model.js";
import { Category } from "./category.model.js";
import { Transaction } from "./transaction.model.js";
import { ExchangeRate } from "./exchangeRate.model.js";
import { Loan } from "./loan.model.js";
import { LoanPayment } from "./loanPayment.model.js";
import { Investment } from "./investment.model.js";
import { InvestmentEarning } from "./investmentEarning.model.js";
import PendingTransaction from "./pendingTransaction.model.js";
import UserTelegramLink from "./userTelegramLink.model.js";
import { PaymentMethod } from "./paymentMethod.model.js";

// Definir relaciones
User.hasMany(Category, { foreignKey: "userId", as: "categories" });
Category.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Transaction, { foreignKey: "userId", as: "transactions" });
Transaction.belongsTo(User, { foreignKey: "userId", as: "user" });

Category.hasMany(Transaction, { foreignKey: "categoryId", as: "transactions" });
Transaction.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

PaymentMethod.hasMany(Transaction, {
  foreignKey: "paymentMethodId",
  as: "transactions",
});
Transaction.belongsTo(PaymentMethod, {
  foreignKey: "paymentMethodId",
  as: "paymentMethod",
});

User.hasMany(ExchangeRate, { foreignKey: "userId", as: "exchangeRates" });
ExchangeRate.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Loan, { foreignKey: "userId", as: "loans" });
Loan.belongsTo(User, { foreignKey: "userId", as: "user" });

Loan.hasMany(LoanPayment, { foreignKey: "loanId", as: "payments" });
LoanPayment.belongsTo(Loan, { foreignKey: "loanId", as: "loan" });

User.hasMany(LoanPayment, { foreignKey: "userId", as: "loanPayments" });
LoanPayment.belongsTo(User, { foreignKey: "userId", as: "user" });

LoanPayment.belongsTo(Transaction, {
  foreignKey: "transactionId",
  as: "transaction",
});

User.hasMany(Investment, { foreignKey: "userId", as: "investments" });
Investment.belongsTo(User, { foreignKey: "userId", as: "user" });

Investment.hasMany(InvestmentEarning, {
  foreignKey: "investmentId",
  as: "earnings",
});
InvestmentEarning.belongsTo(Investment, {
  foreignKey: "investmentId",
  as: "investment",
});

User.hasMany(InvestmentEarning, {
  foreignKey: "userId",
  as: "investmentEarnings",
});
InvestmentEarning.belongsTo(User, { foreignKey: "userId", as: "user" });

InvestmentEarning.belongsTo(Transaction, {
  foreignKey: "transactionId",
  as: "transaction",
});

User.hasMany(PendingTransaction, {
  foreignKey: "userId",
  as: "pendingTransactions",
});
PendingTransaction.belongsTo(User, { foreignKey: "userId", as: "user" });

PendingTransaction.belongsTo(Transaction, {
  foreignKey: "processedTransactionId",
  as: "processedTransaction",
});

User.hasMany(UserTelegramLink, {
  foreignKey: "userId",
  as: "telegramLinks",
});
UserTelegramLink.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(PaymentMethod, { foreignKey: "userId", as: "paymentMethods" });
PaymentMethod.belongsTo(User, { foreignKey: "userId", as: "user" });

export const models = {
  User,
  Category,
  Transaction,
  ExchangeRate,
  Loan,
  LoanPayment,
  Investment,
  InvestmentEarning,
  PendingTransaction,
  UserTelegramLink,
  PaymentMethod,
};

export async function syncModels() {
  await sequelize.sync({ alter: false });
  console.log("✓ Models synchronized");
}
