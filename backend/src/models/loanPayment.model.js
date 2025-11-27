import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const LoanPayment = sequelize.define(
  "LoanPayment",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    loanId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "loans",
        key: "id",
      },
      onDelete: "CASCADE",
      field: "loan_id",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
      comment: "Monto del pago",
    },
    paymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "payment_date",
      comment: "Fecha del pago",
    },
    transactionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "transactions",
        key: "id",
      },
      onDelete: "SET NULL",
      field: "transaction_id",
      comment: "Transacción asociada al pago",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      field: "user_id",
    },
  },
  {
    tableName: "loan_payments",
    timestamps: true,
    underscored: true,
  }
);
