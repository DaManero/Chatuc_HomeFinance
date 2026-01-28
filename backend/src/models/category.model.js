import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Category = sequelize.define(
  "Category",
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
      type: DataTypes.ENUM("Ingreso", "Egreso"),
      allowNull: false,
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Indica si es una categoría de gasto/ingreso fijo mensual",
    },
    parentCategoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "categories",
        key: "id",
      },
      onDelete: "CASCADE",
      comment: "ID de la categoría padre (null si es categoría principal)",
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
    tableName: "categories",
    timestamps: true,
    underscored: true,
  },
);
