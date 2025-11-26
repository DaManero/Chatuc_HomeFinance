import { sequelize } from "../config/db.js";
import { User } from "./user.model.js";
import { Category } from "./category.model.js";
import { Transaction } from "./transaction.model.js";

// Definir relaciones
User.hasMany(Category, { foreignKey: "userId", as: "categories" });
Category.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Transaction, { foreignKey: "userId", as: "transactions" });
Transaction.belongsTo(User, { foreignKey: "userId", as: "user" });

Category.hasMany(Transaction, { foreignKey: "categoryId", as: "transactions" });
Transaction.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

export const models = { User, Category, Transaction };

export async function syncModels() {
  await sequelize.sync({ alter: false });
  console.log("✓ Models synchronized");
}
