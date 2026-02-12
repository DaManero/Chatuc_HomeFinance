import { models } from "../models/index.js";
import { Op } from "sequelize";

export async function getRecurringProjection(req, res) {
  try {
    const userId = req.user.userId;

    // Obtener todas las categorías recurrentes (incluir info del padre)
    const recurringCategories = await models.Category.findAll({
      where: { isRecurring: true, userId },
      include: [
        {
          model: models.Category,
          as: "parentCategory",
          attributes: ["id", "name", "type"],
        },
      ],
      order: [["name", "ASC"]],
    });

    // Obtener el primer y último día del mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Para cada categoría, buscar todas las transacciones del mes actual
    const rawProjections = await Promise.all(
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

        // Determinar el ID y nombre a usar (padre si es subcategoría)
        const groupId = category.parentCategoryId
          ? category.parentCategory.id
          : category.id;
        const groupName = category.parentCategoryId
          ? category.parentCategory.name
          : category.name;
        const groupType = category.parentCategoryId
          ? category.parentCategory.type
          : category.type;

        return {
          groupId,
          groupName,
          groupType,
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

    // Agrupar subcategorías bajo su categoría padre
    const groupedMap = new Map();
    rawProjections.forEach((proj) => {
      const key = proj.groupId;
      if (groupedMap.has(key)) {
        const existing = groupedMap.get(key);
        existing.lastAmount += proj.lastAmount;
        existing.lastAmountARS += proj.lastAmountARS;
        existing.lastAmountUSD += proj.lastAmountUSD;
        existing.projectedAmount += proj.projectedAmount;
        existing.projectedAmountARS += proj.projectedAmountARS;
        existing.projectedAmountUSD += proj.projectedAmountUSD;
        existing.transactionCount += proj.transactionCount;
        // Mantener la fecha más reciente
        if (
          proj.lastDate &&
          (!existing.lastDate ||
            new Date(proj.lastDate) > new Date(existing.lastDate))
        ) {
          existing.lastDate = proj.lastDate;
        }
      } else {
        groupedMap.set(key, {
          categoryId: proj.groupId,
          categoryName: proj.groupName,
          type: proj.groupType,
          lastAmount: proj.lastAmount,
          lastAmountARS: proj.lastAmountARS,
          lastAmountUSD: proj.lastAmountUSD,
          lastDate: proj.lastDate,
          projectedAmount: proj.projectedAmount,
          projectedAmountARS: proj.projectedAmountARS,
          projectedAmountUSD: proj.projectedAmountUSD,
          transactionCount: proj.transactionCount,
        });
      }
    });

    const projections = Array.from(groupedMap.values());

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

    // --- Incluir gastos de tarjeta de crédito de 1 cuota en categorías recurrentes ---
    // Recopilar todos los IDs de categorías recurrentes (padres + subcategorías)
    const allRecurringCategoryIds = recurringCategories.map((c) => c.id);
    const allSubcategories = await models.Category.findAll({
      where: {
        parentCategoryId: { [Op.in]: allRecurringCategoryIds },
        userId,
      },
      attributes: ["id", "parentCategoryId"],
    });
    const allRecurringAndSubIds = [
      ...allRecurringCategoryIds,
      ...allSubcategories.map((sc) => sc.id),
    ];

    // Buscar gastos de TC de 1 cuota del mes actual con categorías recurrentes
    const singleInstallmentExpenses = await models.CreditCardExpense.findAll({
      where: {
        userId,
        installments: 1,
        categoryId: { [Op.in]: allRecurringAndSubIds },
      },
      include: [
        {
          model: models.CreditCardInstallment,
          as: "installmentsList",
          where: {
            dueDate: {
              [Op.between]: [
                firstDay.toISOString().split("T")[0],
                lastDay.toISOString().split("T")[0],
              ],
            },
          },
          required: true,
        },
        {
          model: models.Category,
          as: "category",
          attributes: ["id", "name", "type", "parentCategoryId"],
          include: [
            {
              model: models.Category,
              as: "parentCategory",
              attributes: ["id", "name", "type"],
            },
          ],
        },
      ],
    });

    // Agrupar por categoría padre (igual que el resto)
    const singleInstExpByCategory = new Map();
    singleInstallmentExpenses.forEach((expense) => {
      if (!expense.category) return;

      const cat = expense.category;
      // Usar la categoría padre si es subcategoría
      const categoryId = cat.parentCategoryId
        ? cat.parentCategory?.id || cat.id
        : cat.id;
      const categoryName = cat.parentCategoryId
        ? cat.parentCategory?.name || cat.name
        : cat.name;
      const categoryType = cat.parentCategoryId
        ? cat.parentCategory?.type || cat.type
        : cat.type;

      const current = singleInstExpByCategory.get(categoryId) || {
        categoryId,
        categoryName,
        type: categoryType,
        totalARS: 0,
        totalUSD: 0,
      };

      const expAmount = parseFloat(expense.totalAmount);
      const expCurrency = expense.currency || "ARS";

      if (expCurrency === "USD") {
        current.totalUSD += expAmount;
      } else {
        current.totalARS += expAmount;
      }

      singleInstExpByCategory.set(categoryId, current);
    });

    // Actualizar projectionsByCategory con la referencia actualizada
    const updatedProjectionsByCategory = new Map(
      projections.map((p) => [p.categoryId, p]),
    );

    singleInstExpByCategory.forEach((expTotal) => {
      const existingProjection = updatedProjectionsByCategory.get(
        expTotal.categoryId,
      );

      if (existingProjection) {
        existingProjection.lastAmount += expTotal.totalARS + expTotal.totalUSD;
        existingProjection.lastAmountARS += expTotal.totalARS;
        existingProjection.lastAmountUSD += expTotal.totalUSD;
        existingProjection.projectedAmount +=
          expTotal.totalARS + expTotal.totalUSD;
        existingProjection.projectedAmountARS += expTotal.totalARS;
        existingProjection.projectedAmountUSD += expTotal.totalUSD;
      } else {
        const projectedTotal = expTotal.totalARS + expTotal.totalUSD;
        projections.push({
          categoryId: expTotal.categoryId,
          categoryName: expTotal.categoryName,
          type: expTotal.type,
          lastAmount: projectedTotal,
          lastAmountARS: expTotal.totalARS,
          lastAmountUSD: expTotal.totalUSD,
          lastDate: null,
          projectedAmount: projectedTotal,
          projectedAmountARS: expTotal.totalARS,
          projectedAmountUSD: expTotal.totalUSD,
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
