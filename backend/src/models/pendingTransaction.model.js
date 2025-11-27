import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "./user.model.js";
import { Transaction } from "./transaction.model.js";

const PendingTransaction = sequelize.define(
  "PendingTransaction",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    rawMessage: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Mensaje original enviado por Telegram",
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: "Monto detectado automáticamente",
    },
    currency: {
      type: DataTypes.ENUM("ARS", "USD"),
      allowNull: true,
      defaultValue: "ARS",
      comment: "Moneda detectada",
    },
    type: {
      type: DataTypes.ENUM("Ingreso", "Egreso"),
      allowNull: true,
      comment: "Tipo de transacción detectado",
    },
    suggestedCategory: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Categoría sugerida por el parser",
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Descripción extraída del mensaje",
    },
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Fecha/hora del mensaje",
    },
    status: {
      type: DataTypes.ENUM("pending", "processed", "discarded"),
      allowNull: false,
      defaultValue: "pending",
      comment: "Estado de la transacción pendiente",
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    processedTransactionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "transactions",
        key: "id",
      },
      comment: "ID de la transacción creada al procesar",
    },
    telegramMessageId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "ID del mensaje de Telegram",
    },
    telegramChatId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Chat ID de Telegram del usuario",
    },
  },
  {
    tableName: "pending_transactions",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["userId", "status"],
      },
      {
        fields: ["transactionDate"],
      },
    ],
  }
);

export default PendingTransaction;
