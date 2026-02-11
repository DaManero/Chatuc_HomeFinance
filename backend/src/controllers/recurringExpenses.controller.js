import { models } from "../models/index.js";
import { Op } from "sequelize";

export async function getRecurringProjection(req, res) {
  try {
    const userId = req.user.userId;
    // Obtener todas las categorías recurrentes
    const recurringCategories = await models.Category.findAll({
      where: { isRecurring: true, userId },
      order: [["name", "ASC"]],
    });

    // Obtener el primer y último día del mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Para cada categoría, buscar todas las transacciones del mes actual
    const projections = await Promise.all(
      recurringCategories.map(async (category) => {
        // Obtener IDs de subcategorías para incluirlas en la búsqueda
        const subcategories = await models.Category.findAll({
          where: { parentCategoryId: category.id, userId },
          attributes: ["id"],
        });
        const categoryIds = [category.id, ...subcategories.map((sc) => sc.id)];

        // Buscar todas las transacciones del mes actual para esta categoría y sus subcategorías
        const currentMonthTransactions = await models.Transaction.findAll({
          where: {
            categoryId: { [Op.in]: categoryIds },
            userId,
            date: {
              [Op.between]: [
                firstDay.toISOString().split("T")[0],
                lastDay.toISOString().split("T")[0],
              ],
            },
          },
        });

        // Sumar todas las transacciones del mes actual
        const totals = currentMonthTransactions.reduce(
          (acc, transaction) => {
            const amount = parseFloat(transaction.amount);
            const currency = transaction.currency || "ARS";

            if (currency === "USD") {
              acc.totalUSD += amount;
            } else {
              acc.totalARS += amount;
            }

            return acc;
          },
          { totalARS: 0, totalUSD: 0 },
        );

        // Obtener la última transacción para mostrar la fecha (incluye subcategorías)
        const lastTransaction = await models.Transaction.findOne({
          where: { categoryId: { [Op.in]: categoryIds }, userId },
          order: [["date", "DESC"]],
        });

        // Si no hubo movimientos este mes, usar el último monto registrado
        if (totals.totalARS === 0 && totals.totalUSD === 0 && lastTransaction) {
          const lastAmount = parseFloat(lastTransaction.amount);
          const lastCurrency = lastTransaction.currency || "ARS";

          if (lastCurrency === "USD") {
            totals.totalUSD = lastAmount;
          } else {
            totals.totalARS = lastAmount;
          }
        }

        const totalAmount = totals.totalARS + totals.totalUSD;

        return {
          categoryId: category.id,
          categoryName: category.name,
          type: category.type,
          lastAmount: totalAmount,
          lastAmountARS: totals.totalARS,
          lastAmountUSD: totals.totalUSD,
          lastDate: lastTransaction ? lastTransaction.date : null,
          projectedAmount: totalAmount,
          projectedAmountARS: totals.totalARS,
          projectedAmountUSD: totals.totalUSD,
          transactionCount: currentMonthTransactions.length,
        };
      }),
    );

    const projectionsByCategory = new Map(
      projections.map((projection) => [projection.categoryId, projection]),
    );

    const recurringCharges = await models.CreditCardRecurringCharge.findAll({
      where: {
        userId,
        isActive: true,
        categoryId: { [Op.not]: null },
      },
      include: [
        {
          model: models.Category,
          as: "category",
          attributes: ["id", "name", "type"],
        },
      ],
    });

    const recurringChargesByCategory = new Map();

    recurringCharges.forEach((charge) => {
      if (!charge.category) return;

      const categoryId = charge.category.id;
      const current = recurringChargesByCategory.get(categoryId) || {
        categoryId,
        categoryName: charge.category.name,
        type: charge.category.type,
        totalARS: 0,
        totalUSD: 0,
      };

      const chargeAmount = parseFloat(charge.amount);
      const chargeCurrency = charge.currency || "ARS";

      if (chargeCurrency === "USD") {
        current.totalUSD += chargeAmount;
      } else {
        current.totalARS += chargeAmount;
      }

      recurringChargesByCategory.set(categoryId, current);
    });

    recurringChargesByCategory.forEach((chargeTotal) => {
      const existingProjection = projectionsByCategory.get(
        chargeTotal.categoryId,
      );

      if (existingProjection) {
        existingProjection.lastAmount +=
          chargeTotal.totalARS + chargeTotal.totalUSD;
        existingProjection.lastAmountARS += chargeTotal.totalARS;
        existingProjection.lastAmountUSD += chargeTotal.totalUSD;
        existingProjection.projectedAmount +=
          chargeTotal.totalARS + chargeTotal.totalUSD;
        existingProjection.projectedAmountARS += chargeTotal.totalARS;
        existingProjection.projectedAmountUSD += chargeTotal.totalUSD;
      } else {
        const projectedTotal = chargeTotal.totalARS + chargeTotal.totalUSD;
        projections.push({
          categoryId: chargeTotal.categoryId,
          categoryName: chargeTotal.categoryName,
          type: chargeTotal.type,
          lastAmount: projectedTotal,
          lastAmountARS: chargeTotal.totalARS,
          lastAmountUSD: chargeTotal.totalUSD,
          lastDate: null,
          projectedAmount: projectedTotal,
          projectedAmountARS: chargeTotal.totalARS,
          projectedAmountUSD: chargeTotal.totalUSD,
          transactionCount: 0,
        });
      }
    });

    projections.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

    // Calcular totales
    const totalIngresosARS = projections
      .filter((p) => p.type === "Ingreso")
      .reduce((sum, p) => sum + p.projectedAmountARS, 0);

    const totalIngresosUSD = projections
      .filter((p) => p.type === "Ingreso")
      .reduce((sum, p) => sum + p.projectedAmountUSD, 0);

    const totalEgresosARS = projections
      .filter((p) => p.type === "Egreso")
      .reduce((sum, p) => sum + p.projectedAmountARS, 0);

    const totalEgresosUSD = projections
      .filter((p) => p.type === "Egreso")
      .reduce((sum, p) => sum + p.projectedAmountUSD, 0);

    const totalIngresos = projections
      .filter((p) => p.type === "Ingreso")
      .reduce((sum, p) => sum + p.projectedAmount, 0);

    const totalEgresos = projections
      .filter((p) => p.type === "Egreso")
      .reduce((sum, p) => sum + p.projectedAmount, 0);

    const balance = totalIngresos - totalEgresos;
    const balanceARS = totalIngresosARS - totalEgresosARS;
    const balanceUSD = totalIngresosUSD - totalEgresosUSD;

    res.json({
      projections,
      summary: {
        totalIngresos,
        totalEgresos,
        balance,
        totalIngresosARS,
        totalIngresosUSD,
        totalEgresosARS,
        totalEgresosUSD,
        balanceARS,
        balanceUSD,
      },
    });
  } catch (err) {
    console.error("Error en getRecurringProjection:", err);
    res.status(500).json({ error: "Error al obtener proyección" });
  }
}
