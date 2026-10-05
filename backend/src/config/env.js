import dotenv from "dotenv";
dotenv.config();

const DEFAULT_DB_HOST = "home-finance-db.railway.internal";
const DEFAULT_DB_PORT = 5432;

const dbHostFromEnv = (process.env.DB_HOST || "").trim();
const dbHost = dbHostFromEnv || DEFAULT_DB_HOST;
const dbPort = Number(process.env.DB_PORT) || DEFAULT_DB_PORT;
const dbUrl = (process.env.DATABASE_URL || "").trim() || undefined;

export const env = {
  port: process.env.PORT || 3000,
  db: {
    // When set, DATABASE_URL takes precedence over the individual DB_* values
    url: dbUrl,
    host: dbHost,
    port: dbPort,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret",
    accessTtl: process.env.JWT_ACCESS_TTL || "15m",
    refreshTtl: process.env.JWT_REFRESH_TTL || "7d",
  },
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  API_URL: process.env.API_URL || "http://localhost:3000",
};

function describeDatabaseUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.username ? `${parsed.username}:***@` : ""}${parsed.host}${parsed.pathname}`;
  } catch {
    return "(invalid DATABASE_URL)";
  }
}

// Log DB settings at startup (never the password) to diagnose connection issues
console.log("[env] Database configuration:", {
  source: env.db.url ? "DATABASE_URL" : "DB_* variables",
  databaseUrl: env.db.url ? describeDatabaseUrl(env.db.url) : "(not set)",
  host: env.db.host,
  hostSource: dbHostFromEnv ? "DB_HOST" : "default fallback",
  port: env.db.port,
  user: env.db.user,
  name: env.db.name,
  passwordSet: Boolean(env.db.password),
  ssl:
    process.env.NODE_ENV === "production"
      ? process.env.DB_SSL !== "false"
      : false,
  nodeEnv: process.env.NODE_ENV,
});
