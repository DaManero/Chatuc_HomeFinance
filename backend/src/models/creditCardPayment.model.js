import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const CreditCardPayment = sequelize.define(
  "CreditCardPayment",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
      comment: "Monto pagado del resumen",
    },
    paymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Fecha en que se realizó el pago",
    },
    statementMonth: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 12,
      },
      comment: "Mes del resumen que cubre el pago",
    },
    statementYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 2000,
      },
      comment: "Año del resumen que cubre el pago",
    },
    paymentMonth: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 12,
      },
      comment: "Mes financiero al que corresponde el pago",
    },
    paymentYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 2000,
      },
      comment: "Año financiero al que corresponde el pago",
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "ARS",
      comment: "Moneda del pago (ARS, USD)",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Notas adicionales sobre el pago",
    },
    coveredInstallmentIds: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "IDs de cuotas cubiertas por este pago",
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
    transactionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "transactions",
        key: "id",
      },
      onDelete: "SET NULL",
      comment: "Transacción de egreso asociada al pago (afecta el balance)",
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
    tableName: "credit_card_payments",
    timestamps: true,
    underscored: true,
  },
);
