import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const CreditCardRecurringCharge = sequelize.define(
  "CreditCardRecurringCharge",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Descripción del débito (ej: Netflix, Spotify)",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
      comment: "Monto mensual del débito",
    },
    chargeDay: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 31,
      },
      comment: "Día del mes en que se carga (1-31)",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: "Indica si el débito está activo",
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "ARS",
      comment: "Moneda del débito (ARS, USD)",
    },
    creditCardId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "credit_cards",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "categories",
        key: "id",
      },
      onDelete: "SET NULL",
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
    tableName: "credit_card_recurring_charges",
    timestamps: true,
    underscored: true,
  }
);
