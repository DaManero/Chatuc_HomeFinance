import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Investment = sequelize.define(
  "Investment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM(
        "Plazo Fijo",
        "Compra Divisa",
        "Venta Divisa",
        "Otro"
      ),
      allowNull: false,
      comment: "Tipo de inversión",
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: "Monto de la inversión",
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "ARS",
      comment: "Moneda de la inversión",
    },
    exchangeRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Tipo de cambio usado (para compra/venta divisas)",
    },
    exchangeAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: "Monto en la otra moneda (para compra/venta divisas)",
    },
    exchangeCurrency: {
      type: DataTypes.STRING(3),
      allowNull: true,
      comment: "Moneda de intercambio (para compra/venta divisas)",
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Fecha de inicio",
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Fecha de vencimiento",
    },
    interestRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: "Tasa de interés anual",
    },
    status: {
      type: DataTypes.ENUM("Activo", "Vencido", "Rescatado"),
      allowNull: false,
      defaultValue: "Activo",
      comment: "Estado de la inversión",
    },
    entity: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Banco, casa de cambio, etc.",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "investments",
    timestamps: true,
  }
);
