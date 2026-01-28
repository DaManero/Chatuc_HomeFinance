import { sequelize } from "./src/config/db.js";
import { QueryTypes } from "sequelize";

async function cleanupDatabase() {
  try {
    console.log("🗑️  Iniciando limpieza de base de datos...");
    console.log("✓ Se conservarán: usuarios, préstamos e inversiones\n");

    // Desactivar restricciones de clave foránea temporalmente
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", {
      type: QueryTypes.RAW,
    });

    // Tablas a limpiar (en orden de dependencias)
    const tablesToClean = [
      "credit_card_recurring_charges",
      "credit_card_payments",
      "credit_card_installments",
      "credit_card_expenses",
      "credit_cards",
      "pending_transactions",
      "recurring_transactions",
      "transactions",
      "categories",
      "payment_methods",
      "exchange_rates",
      "user_telegram_links",
      "investment_earnings",
    ];

    // Limpiar cada tabla
    for (const table of tablesToClean) {
      await sequelize.query(`DELETE FROM ${table}`, { type: QueryTypes.RAW });
      console.log(`✓ Limpiada tabla: ${table}`);
    }

    // Reactivar restricciones de clave foránea
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", {
      type: QueryTypes.RAW,
    });

    console.log("\n✅ Base de datos limpiada exitosamente");
    console.log("📊 Datos conservados:");
    console.log("   - Usuarios");
    console.log("   - Préstamos");
    console.log("   - Inversiones");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error al limpiar la base de datos:", error);
    process.exit(1);
  }
}

cleanupDatabase();
