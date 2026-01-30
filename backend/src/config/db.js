import { Sequelize } from "sequelize";
import { env } from "./env.js";

export const sequelize = new Sequelize(
  env.db.name,
  env.db.user,
  env.db.password,
  {
    host: env.db.host,
    port: env.db.port,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
);

export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✓ DB connection OK");
  } catch (err) {
    console.error("✗ DB connection error:", err.message);
  }
}
