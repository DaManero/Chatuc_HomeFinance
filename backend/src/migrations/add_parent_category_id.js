import { sequelize } from "../config/db.js";
import { QueryTypes } from "sequelize";

async function up() {
  // Verificar si la columna ya existe
  const columns = await sequelize.query(
    `SHOW COLUMNS FROM categories LIKE 'parent_category_id'`,
    { type: QueryTypes.SELECT },
  );

  if (columns.length === 0) {
    await sequelize.query(
      `
      ALTER TABLE categories 
      ADD COLUMN parent_category_id INT UNSIGNED NULL AFTER is_recurring,
      ADD CONSTRAINT fk_categories_parent 
        FOREIGN KEY (parent_category_id) 
        REFERENCES categories(id) 
        ON DELETE CASCADE
      `,
      { type: QueryTypes.RAW },
    );
    console.log("✓ Columna parent_category_id agregada a categories");
  } else {
    console.log("⚠️  Columna parent_category_id ya existe");
  }
}

async function down() {
  await sequelize.query(
    `
    ALTER TABLE categories 
    DROP FOREIGN KEY fk_categories_parent,
    DROP COLUMN parent_category_id
    `,
    { type: QueryTypes.RAW },
  );
  console.log("✓ Columna parent_category_id eliminada");
}

// Ejecutar migración
if (import.meta.url === `file://${process.argv[1]}`) {
  up()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export { up, down };
