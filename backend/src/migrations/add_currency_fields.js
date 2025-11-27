import { sequelize } from "../config/db.js";

async function addCurrencyFields() {
  try {
    // Agregar campo currency a transactions
    await sequelize.query(`
      ALTER TABLE transactions 
      ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'ARS' 
      COMMENT 'Moneda de la transacción (ARS, USD)'
    `);
    console.log("✓ Campo currency agregado a tabla transactions");

    console.log("✓ Migración completada exitosamente");
    process.exit(0);
  } catch (error) {
    if (error.original?.errno === 1060) {
      console.log("⚠ Los campos currency ya existen");
      process.exit(0);
    } else {
      console.error("✗ Error en migración:", error.message);
      process.exit(1);
    }
  }
}

addCurrencyFields();
