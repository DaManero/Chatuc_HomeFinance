import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const ExchangeRate = sequelize.define(
  "ExchangeRate",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    currencyFrom: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "USD",
      field: "currency_from",
    },
    currencyTo: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "ARS",
      field: "currency_to",
    },
    rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
      comment: "Tasa de cambio",
    },
    source: {
      type: DataTypes.ENUM("manual", "api", "oficial", "blue"),
      allowNull: false,
      defaultValue: "api",
      comment: "Origen de la cotización",
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    tableName: "exchange_rates",
    timestamps: true,
    underscored: true,
  }
);
