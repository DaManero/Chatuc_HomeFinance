import { Sequelize } from "sequelize";
import { env } from "./env.js";

const dialectOptions =
  process.env.NODE_ENV === "production"
    ? {
        ssl:
          process.env.DB_SSL !== "false"
            ? {
                require: true,
                rejectUnauthorized: false,
              }
            : false,
      }
    : {};

export const sequelize = new Sequelize(
  env.db.name,
  env.db.user,
  env.db.password,
  {
    host: env.db.host,
    port: env.db.port,
    dialect: "postgres",
    logging: false,
    dialectOptions,
    pool: {
      max: 20,
      min: 5,
      idle: 10000,
      acquire: 30000,
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
