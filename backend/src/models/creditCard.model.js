import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const CreditCard = sequelize.define(
  "CreditCard",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Nombre identificador de la tarjeta (ej: Visa Personal)",
    },
    bank: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Entidad emisora (ej: Banco Galicia)",
    },
    brand: {
      type: DataTypes.ENUM("Visa", "Mastercard", "American Express", "Otras"),
      allowNull: false,
      defaultValue: "Otras",
      comment: "Marca de la tarjeta",
    },
    lastFourDigits: {
      type: DataTypes.STRING(4),
      allowNull: false,
      validate: {
        len: [4, 4],
        isNumeric: true,
      },
      comment: "Últimos 4 dígitos de la tarjeta",
    },
    expirationMonth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
      comment: "Mes de vencimiento (1-12)",
    },
    expirationYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2024,
      },
      comment: "Año de vencimiento (YYYY)",
    },
    dueDay: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 31,
      },
      comment: "Día del mes de vencimiento del pago (1-31)",
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
    tableName: "credit_cards",
    timestamps: true,
    underscored: true,
  }
);
