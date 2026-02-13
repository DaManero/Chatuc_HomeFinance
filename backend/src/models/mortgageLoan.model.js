import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const MortgageLoan = sequelize.define(
  "MortgageLoan",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: "Nombre descriptivo del préstamo (ej: Hipotecario Banco Nación)",
    },
    totalUva: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: "total_uva",
      comment: "Monto total del préstamo en UVAs",
    },
    paidUva: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: "paid_uva",
      comment: "Total de UVAs pagadas hasta ahora",
    },
    totalInstallments: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 360,
      field: "total_installments",
      comment: "Cantidad total de cuotas",
    },
    paidInstallments: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "paid_installments",
      comment: "Cantidad de cuotas pagadas",
    },
    annualRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: "annual_rate",
      comment: "TNA del préstamo (%)",
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "start_date",
      comment: "Fecha de inicio del préstamo",
    },
    status: {
      type: DataTypes.ENUM("Activo", "Pagado"),
      allowNull: false,
      defaultValue: "Activo",
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
    tableName: "mortgage_loans",
    timestamps: true,
    underscored: true,
  },
);
