import { models } from "../models/index.js";
import { Op } from "sequelize";

export async function getRecurringProjection(req, res) {
  try {
    // Obtener todas las categorías recurrentes
    const recurringCategories = await models.Category.findAll({
      where: { isRecurring: true },
      order: [["name", "ASC"]],
    });

    // Obtener el primer y último día del mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Para cada categoría, buscar todas las transacciones del mes actual
    const projections = await Promise.all(
      recurringCategories.map(async (category) => {
        // Buscar todas las transacciones del mes actual para esta categoría
        const currentMonthTransactions = await models.Transaction.findAll({
          where: {
            categoryId: category.id,
            date: {
              [Op.between]: [
                firstDay.toISOString().split("T")[0],
                lastDay.toISOString().split("T")[0],
              ],
            },
          },
        });

        // Sumar todas las transacciones del mes actual
        const totalAmount = currentMonthTransactions.reduce(
          (sum, t) => sum + parseFloat(t.amount),
          0
        );

        // Obtener la última transacción para mostrar la fecha
        const lastTransaction = await models.Transaction.findOne({
          where: { categoryId: category.id },
          order: [["date", "DESC"]],
        });

        return {
          categoryId: category.id,
          categoryName: category.name,
          type: category.type,
          lastAmount: totalAmount,
          lastDate: lastTransaction ? lastTransaction.date : null,
          projectedAmount: totalAmount,
          transactionCount: currentMonthTransactions.length,
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
