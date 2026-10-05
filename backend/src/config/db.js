import { Sequelize } from "sequelize";
import { env } from "./env.js";

// SSL configuration.
// - DB_SSL=true|false forces SSL on/off (default: on in production, off otherwise).
// - DB_SSL_CA holds the PEM certificate (\n-escaped allowed). When provided,
//   certificates are fully verified (rejectUnauthorized: true).
// - DB_SSL_REJECT_UNAUTHORIZED=true|false overrides verification explicitly.
//   Without a CA, Railway's self-signed certificate cannot be verified, so the
//   default is false in that case.
const isProduction = process.env.NODE_ENV === "production";
const sslEnabled =
  process.env.DB_SSL !== undefined
    ? process.env.DB_SSL === "true"
    : isProduction;

const sslCa = process.env.DB_SSL_CA
  ? process.env.DB_SSL_CA.replace(/\\n/g, "\n")
  : undefined;

const rejectUnauthorized =
  process.env.DB_SSL_REJECT_UNAUTHORIZED !== undefined
    ? process.env.DB_SSL_REJECT_UNAUTHORIZED === "true"
    : Boolean(sslCa);

const dialectOptions = {
  // Fail fast instead of hanging until the OS-level ETIMEDOUT.
  connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS) || 10000,
  keepAlive: true,
  ...(sslEnabled
    ? {
        ssl: {
          require: true,
          rejectUnauthorized,
          ...(sslCa ? { ca: sslCa } : {}),
        },
      }
    : {}),
};

console.log(
  `[db] host=${env.db.host} port=${env.db.port} ssl=${sslEnabled} rejectUnauthorized=${sslEnabled ? rejectUnauthorized : "n/a"}`,
);

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
    const cause = err.original || err.parent;
    if (cause) {
      console.error("  code:", cause.code, "address:", cause.address, "port:", cause.port);
    }
  }
}
