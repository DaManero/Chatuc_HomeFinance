import { sequelize } from "./src/config/db.js";
import { models } from "./src/models/index.js";

const categoriesData = [
  {
    name: "Gastos del Departamento",
    subcategories: [
      "Hipoteca",
      "Expensas",
      "Electricidad",
      "Gas",
      "Agua",
      "Internet",
      "ABL",
      "Limpieza",
      "Mantenimiento",
    ],
  },
  {
    name: "Alimentación",
    subcategories: ["Supermercado", "Verdulería", "Carnicería", "Otros"],
  },
  {
    name: "Auto",
    subcategories: [
      "Combustible",
      "Mantenimiento",
      "Estacionamiento",
      "Seguros del auto",
      "Patente",
    ],
  },
  {
    name: "Deporte y Salud",
    subcategories: [
      "Consultas medicas",
      "Farmacia",
      "Gimnasio/Deportes",
      "Peluquería",
    ],
  },
  {
    name: "Educación",
    subcategories: [
      "Cursos/Capacitaciones",
      "Materiales de estudio",
      "Libros",
      "Suscripciones educativas",
    ],
  },
  {
    name: "Suscripciones",
    subcategories: ["Netflix", "Spotify", "Apple", "Git Copilot"],
  },
  {
    name: "Ropa y Accesorios",
    subcategories: ["Ropa", "Zapatillas", "Otros"],
  },
  {
    name: "Impuestos y Servicios",
    subcategories: ["Servicios profesionales", "Honorarios", "Trámites"],
  },
];

async function seedCategories() {
  try {
    console.log("🌱 Poblando categorías iniciales...\n");

    // Obtener todos los usuarios
    const users = await models.User.findAll();

    if (users.length === 0) {
      console.log("⚠️  No hay usuarios en la base de datos");
      process.exit(0);
    }

    for (const user of users) {
      console.log(
        `📝 Creando categorías para usuario: ${user.username} (ID: ${user.id})`,
      );

      for (const catData of categoriesData) {
        // Crear categoría principal
        const mainCategory = await models.Category.create({
          name: catData.name,
          type: "Egreso",
          isRecurring: false,
          parentCategoryId: null,
          userId: user.id,
        });

        console.log(`  ✓ Categoría: ${catData.name}`);

        // Crear subcategorías
        for (const subName of catData.subcategories) {
          await models.Category.create({
            name: subName,
            type: "Egreso",
            isRecurring: false,
            parentCategoryId: mainCategory.id,
            userId: user.id,
          });
          console.log(`    - ${subName}`);
        }
      }
      console.log("");
    }

    console.log("✅ Categorías creadas exitosamente para todos los usuarios");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al poblar categorías:", error);
    process.exit(1);
  }
}

seedCategories();
