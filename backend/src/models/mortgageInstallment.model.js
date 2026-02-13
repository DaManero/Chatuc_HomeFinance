import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const MortgageInstallment = sequelize.define(
  "MortgageInstallment",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    mortgageLoanId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "mortgage_loans", key: "id" },
      onDelete: "CASCADE",
      field: "mortgage_loan_id",
    },
    installmentNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "installment_number",
      comment: "Número de cuota (1 a 360)",
    },
    capitalUva: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "capital_uva",
      comment: "Capital en UVAs de esta cuota",
    },
    interestUva: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "interest_uva",
      comment: "Interés en UVAs de esta cuota",
    },
    totalUva: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "total_uva",
      comment: "Total en UVAs (capital + interés)",
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "due_date",
      comment: "Fecha de vencimiento de la cuota",
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_paid",
    },
    paidDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "paid_date",
      comment: "Fecha en que se pagó efectivamente",
    },
    uvaRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "uva_rate",
      comment: "Cotización del UVA al momento del pago",
    },
    amountPaid: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true,
      field: "amount_paid",
      comment: "Monto pagado en pesos (totalUva × uvaRate)",
    },
    dollarRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "dollar_rate",
      comment: "Cotización del dólar al momento del pago (dato estadístico)",
    },
    amountUsd: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: "amount_usd",
      comment: "Equivalente en USD (amountPaid / dollarRate)",
    },
    transactionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "transactions", key: "id" },
      onDelete: "SET NULL",
      field: "transaction_id",
      comment: "Transacción asociada al pago",
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
      field: "user_id",
    },
  },
  {
    tableName: "mortgage_installments",
    timestamps: true,
    underscored: true,
  },
);
