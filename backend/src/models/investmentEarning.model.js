import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const InvestmentEarning = sequelize.define(
  "InvestmentEarning",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    investmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "investments",
        key: "id",
      },
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: "Monto del rendimiento",
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "ARS",
      comment: "Moneda del rendimiento",
    },
    earningDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Fecha del rendimiento",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Notas adicionales",
    },
    transactionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "transactions",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "investment_earnings",
    timestamps: true,
    underscored: true,
  }
);
