import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { testConnection } from "./config/db.js";
import { syncModels } from "./models/index.js";

let server;
let retryAttempted = false;

async function bootstrap() {
  try {
    const app = createApp();

    await testConnection();
    await syncModels();

    server = app.listen(env.port, () => {
      console.log(`✓ Server running on port ${env.port}`);
      retryAttempted = false; // Reset flag on successful start
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${env.port} is already in use`);

        if (!retryAttempted) {
          retryAttempted = true;
          console.log("⏳ Esperando 3 segundos y reintentando...");
          setTimeout(() => {
            server.close();
            server.listen(env.port);
          }, 3000);
        } else {
          console.error("❌ Port still in use after retry. Exiting...");
          process.exit(1);
        }
      } else {
        console.error("❌ Server error:", error);
      }
    });
  } catch (error) {
    console.error("❌ Bootstrap error:", error);
    process.exit(1);
  }
}

// Manejo de señales para cierre limpio
process.on("SIGTERM", () => {
  console.log("\n👋 SIGTERM received, closing server gracefully");
  if (server) {
    server.close(() => {
      console.log("✓ Server closed");
      process.exit(0);
    });
  }
});

process.on("SIGINT", () => {
  console.log("\n👋 SIGINT received, closing server gracefully");
  if (server) {
    server.close(() => {
      console.log("✓ Server closed");
      process.exit(0);
    });
  }
});

bootstrap();
