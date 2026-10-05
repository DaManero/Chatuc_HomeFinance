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

const sequelizeOptions = {
  dialect: "postgres",
  logging: false,
  dialectOptions,
  pool: {
    max: 20,
    min: 5,
    idle: 10000,
    acquire: 30000,
  },
};

export const sequelize = env.db.url
  ? new Sequelize(env.db.url, sequelizeOptions)
  : new Sequelize(env.db.name, env.db.user, env.db.password, {
      ...sequelizeOptions,
      host: env.db.host,
      port: env.db.port,
    });

export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✓ DB connection OK");
  } catch (err) {
    console.error("✗ DB connection error:", err.message);
  }
}
