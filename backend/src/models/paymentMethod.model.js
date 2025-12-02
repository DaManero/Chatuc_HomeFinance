import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const PaymentMethod = sequelize.define(
  "PaymentMethod",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "Efectivo",
        "Tarjeta",
        "Transferencia",
        "Billetera Virtual",
        "Otro"
      ),
      allowNull: false,
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
    tableName: "payment_methods",
    timestamps: true,
    underscored: true,
  }
);
