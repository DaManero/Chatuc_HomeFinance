import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const CreditCardExpense = sequelize.define(
  "CreditCardExpense",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Descripción del gasto",
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
      comment: "Monto total del gasto (ya incluye interés si aplica)",
    },
    installments: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
      comment: "Cantidad de cuotas (1 = pago único)",
    },
    purchaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Fecha de la compra",
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "ARS",
      comment: "Moneda del gasto (ARS, USD)",
    },
    creditCardId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "credit_cards",
        key: "id",
      },
      onDelete: "RESTRICT",
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
      onDelete: "RESTRICT",
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "credit_card_expenses",
    timestamps: true,
    underscored: true,
  }
);
