import { models } from "../models/index.js";
import { Op } from "sequelize";

export async function getRecurringProjection(req, res) {
  try {
    const userId = req.user.userId;

    // Obtener todas las categorías recurrentes del usuario
    const recurringCategories = await models.Category.findAll({
      where: { userId, isRecurring: true },
      order: [["name", "ASC"]],
    });

    // Para cada categoría, buscar la última transacción
    const projections = await Promise.all(
      recurringCategories.map(async (category) => {
        const lastTransaction = await models.Transaction.findOne({
          where: { categoryId: category.id, userId },
          order: [["date", "DESC"]],
        });

        return {
          categoryId: category.id,
          categoryName: category.name,
          type: category.type,
          lastAmount: lastTransaction ? parseFloat(lastTransaction.amount) : 0,
          lastDate: lastTransaction ? lastTransaction.date : null,
          projectedAmount: lastTransaction
            ? parseFloat(lastTransaction.amount)
            : 0,
        };
      })
    );

    // Calcular totales
    const totalIngresos = projections
      .filter((p) => p.type === "Ingreso")
      .reduce((sum, p) => sum + p.projectedAmount, 0);

    const totalEgresos = projections
      .filter((p) => p.type === "Egreso")
      .reduce((sum, p) => sum + p.projectedAmount, 0);

    const balance = totalIngresos - totalEgresos;

    res.json({
      projections,
      summary: {
        totalIngresos,
        totalEgresos,
        balance,
      },
    });
  } catch (err) {
    console.error("Error en getRecurringProjection:", err);
    res.status(500).json({ error: "Error al obtener proyección" });
  }
}
