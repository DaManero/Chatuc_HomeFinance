import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const CreditCardInstallment = sequelize.define(
  "CreditCardInstallment",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    installmentNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Número de cuota (1, 2, 3...)",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
      comment: "Monto de esta cuota",
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Fecha de vencimiento de la cuota",
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Indica si la cuota fue pagada",
    },
    paidDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Fecha en que se pagó la cuota",
    },
    expenseId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "credit_card_expenses",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "credit_card_installments",
    timestamps: true,
    underscored: true,
  }
);
