import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Loan = sequelize.define(
  "Loan",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    entity: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Banco/Entidad/Persona que otorgó el préstamo",
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
      field: "total_amount",
      comment: "Monto total del préstamo",
    },
    pendingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
      field: "pending_amount",
      comment: "Monto pendiente por pagar",
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "ARS",
      comment: "Moneda del préstamo (ARS, USD)",
    },
    interestRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: "interest_rate",
      comment: "Tasa de interés (%)",
    },
    loanDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "loan_date",
      comment: "Fecha de otorgamiento",
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "due_date",
      comment: "Fecha de vencimiento final",
    },
    installments: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Cantidad de cuotas",
    },
    installmentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "installment_amount",
      comment: "Monto de cuota fija",
    },
    status: {
      type: DataTypes.ENUM("Activo", "Pagado", "Vencido"),
      allowNull: false,
      defaultValue: "Activo",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Notas adicionales",
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
    tableName: "loans",
    timestamps: true,
    underscored: true,
  }
);
