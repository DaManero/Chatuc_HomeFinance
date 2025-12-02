import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "home_finance",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mariadb",
    logging: false,
  }
);

async function checkCategories() {
  try {
    const [results] = await sequelize.query(
      'SELECT id, name, type FROM categories WHERE type = "Egreso" ORDER BY name'
    );

    console.log("\nCategorías de Egreso disponibles:");
    results.forEach((c) => {
      console.log(`  ID: ${c.id} - Nombre: ${c.name}`);
    });

    await sequelize.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

checkCategories();
