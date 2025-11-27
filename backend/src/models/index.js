import { sequelize } from "../config/db.js";
import { User } from "./user.model.js";
import { Category } from "./category.model.js";
import { Transaction } from "./transaction.model.js";
import { ExchangeRate } from "./exchangeRate.model.js";
import { Loan } from "./loan.model.js";
import { LoanPayment } from "./loanPayment.model.js";

// Definir relaciones
User.hasMany(Category, { foreignKey: "userId", as: "categories" });
Category.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Transaction, { foreignKey: "userId", as: "transactions" });
Transaction.belongsTo(User, { foreignKey: "userId", as: "user" });

Category.hasMany(Transaction, { foreignKey: "categoryId", as: "transactions" });
Transaction.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

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

export const models = {
  User,
  Category,
  Transaction,
  ExchangeRate,
  Loan,
  LoanPayment,
};

export async function syncModels() {
  await sequelize.sync({ alter: false });
  console.log("✓ Models synchronized");
}
