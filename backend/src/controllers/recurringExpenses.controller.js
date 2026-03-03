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

    // IDs de todas las categorías recurrentes (para filtros posteriores)
    const allRecurringCategoryIds = recurringCategories.map((c) => c.id);

    // Obtener el primer y último día del mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Para cada categoría, buscar todas las transacciones del mes actual
    const rawProjections = await Promise.all(
      recurringCategories.map(async (category) => {
        // Usar solo el ID de la categoría recurrente directa
        // Las subcategorías recurrentes se procesan en su propia iteración del loop
        const categoryIds = [category.id];

        // Buscar todas las transacciones del mes actual para esta categoría recurrente
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

        // Fecha de última transacción del mes actual (solo del mes en curso)
        const lastTransaction =
          currentMonthTransactions.length > 0
            ? currentMonthTransactions.reduce(
                (latest, tx) =>
                  !latest || tx.date > latest.date ? tx : latest,
                null,
              )
            : null;

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
        categoryId: { [Op.in]: allRecurringCategoryIds },
      },
      include: [
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

    const recurringChargesByCategory = new Map();

    recurringCharges.forEach((charge) => {
      if (!charge.category) return;

      const cat = charge.category;
      // Resolver a la categoría padre si es subcategoría
      const categoryId = cat.parentCategoryId
        ? cat.parentCategory?.id || cat.id
        : cat.id;
      const categoryName = cat.parentCategoryId
        ? cat.parentCategory?.name || cat.name
        : cat.name;
      const categoryType = cat.parentCategoryId
        ? cat.parentCategory?.type || cat.type
        : cat.type;

      const current = recurringChargesByCategory.get(categoryId) || {
        categoryId,
        categoryName,
        type: categoryType,
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
    // Buscar gastos de TC de 1 cuota del mes actual asignados a categorías recurrentes
    // Usamos purchaseDate (no dueDate de la cuota) porque para 1 cuota el dueDate cae en el mes siguiente
    const singleInstallmentExpenses = await models.CreditCardExpense.findAll({
      where: {
        userId,
        installments: 1,
        categoryId: { [Op.in]: allRecurringCategoryIds },
        purchaseDate: {
          [Op.between]: [
            firstDay.toISOString().split("T")[0],
            lastDay.toISOString().split("T")[0],
          ],
        },
      },
      include: [
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

export async function getProjectionHistory(req, res) {
  try {
    const userId = req.user.userId;
    const months = Math.min(parseInt(req.query.months) || 6, 24);

    const now = new Date();

    // Construir array de los últimos N meses (excluyendo el mes actual)
    const monthRanges = [];
    for (let i = months; i >= 1; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      monthRanges.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        year: d.getFullYear(),
        monthNumber: d.getMonth() + 1,
        firstDay: firstDay.toISOString().split("T")[0],
        lastDay: lastDay.toISOString().split("T")[0],
      });
    }

    // Consultar todas las transacciones del rango completo de una sola vez
    const oldest = monthRanges[0].firstDay;
    const newest = monthRanges[monthRanges.length - 1].lastDay;

    const transactions = await models.Transaction.findAll({
      where: {
        userId,
        date: { [Op.between]: [oldest, newest] },
      },
      include: [
        {
          model: models.Category,
          as: "category",
          attributes: ["id", "name", "type"],
          required: false,
        },
      ],
      attributes: ["id", "amount", "currency", "date", "type", "categoryId"],
      order: [["date", "ASC"]],
    });

    // Agrupar transacciones por mes → categoría
    const historyMap = new Map(); // key: "YYYY-MM"

    monthRanges.forEach((m) => {
      historyMap.set(m.key, {
        month: m.key,
        year: m.year,
        monthNumber: m.monthNumber,
        categories: new Map(), // categoryId → { categoryName, type, totalARS, totalUSD }
        totalIngresosARS: 0,
        totalIngresosUSD: 0,
        totalEgresosARS: 0,
        totalEgresosUSD: 0,
      });
    });

    transactions.forEach((tx) => {
      const date = new Date(tx.date + "T00:00:00");
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthData = historyMap.get(key);
      if (!monthData) return;

      const amount = parseFloat(tx.amount);
      const currency = tx.currency || "ARS";
      const categoryId = tx.categoryId || 0;
      const categoryName = tx.category?.name || "Sin categoría";
      const categoryType = tx.category?.type || tx.type || "Egreso";

      if (!monthData.categories.has(categoryId)) {
        monthData.categories.set(categoryId, {
          categoryId,
          categoryName,
          type: categoryType,
          totalARS: 0,
          totalUSD: 0,
        });
      }

      const cat = monthData.categories.get(categoryId);
      if (currency === "USD") {
        cat.totalUSD += amount;
      } else {
        cat.totalARS += amount;
      }

      // Acumular totales del mes
      if (categoryType === "Ingreso") {
        if (currency === "USD") monthData.totalIngresosUSD += amount;
        else monthData.totalIngresosARS += amount;
      } else {
        if (currency === "USD") monthData.totalEgresosUSD += amount;
        else monthData.totalEgresosARS += amount;
      }
    });

    // Convertir Maps a arrays y ordenar categorías por nombre
    const history = Array.from(historyMap.values()).map((monthData) => ({
      month: monthData.month,
      year: monthData.year,
      monthNumber: monthData.monthNumber,
      totalIngresosARS: monthData.totalIngresosARS,
      totalIngresosUSD: monthData.totalIngresosUSD,
      totalEgresosARS: monthData.totalEgresosARS,
      totalEgresosUSD: monthData.totalEgresosUSD,
      balanceARS: monthData.totalIngresosARS - monthData.totalEgresosARS,
      balanceUSD: monthData.totalIngresosUSD - monthData.totalEgresosUSD,
      categories: Array.from(monthData.categories.values()).sort((a, b) =>
        a.categoryName.localeCompare(b.categoryName),
      ),
    }));

    res.json({ history });
  } catch (err) {
    console.error("Error en getProjectionHistory:", err);
    res.status(500).json({ error: "Error al obtener historial" });
  }
}
