import { sequelize } from "./src/config/db.js";
import { User } from "./src/models/user.model.js";

async function updateUsers() {
  try {
    await sequelize.authenticate();
    console.log("✓ Conectado a la DB");

    // Verificar estructura de la tabla
    const columns = await sequelize.getQueryInterface().describeTable("users");

    console.log("\nColumnas en la tabla users:");
    Object.keys(columns).forEach((colName) => {
      const col = columns[colName];
      console.log(
        `- ${colName} (${col.type}) - Null: ${col.allowNull}, Default: ${col.defaultValue}`
      );
    });

    await sequelize.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

updateUsers();
