import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const UserTelegramLink = sequelize.define(
  "UserTelegramLink",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    telegramChatId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    telegramUsername: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "user_telegram_links",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["telegramChatId"],
      },
      {
        fields: ["isActive"],
      },
    ],
  }
);

export default UserTelegramLink;
