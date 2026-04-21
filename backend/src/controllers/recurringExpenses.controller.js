import { models } from "../models/index.js";
import { Op } from "sequelize";
import {
  getPaymentPeriodForInstallment,
  getPeriodKey,
} from "../utils/creditCardPeriods.js";

export async function getRecurringProjection(req, res) {
  try {
    // Obtener el primer y último día del mes actual
    const now = new Date();
    const firstDayStr = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const lastDayStr = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    // ── 1. Obtener todas las categorías recurrentes con su padre ──────────────
    const recurringCategories = await models.Category.findAll({
      where: { isRecurring: true },
      include: [
        {
          model: models.Category,
          as: "parentCategory",
          attributes: ["id", "name", "type"],
          required: false,
        },
      ],
      order: [["name", "ASC"]],
    });

    if (recurringCategories.length === 0) {
      return res.json({
        projections: [],
        summary: {
          totalIngresos: 0,
          totalEgresos: 0,
          balance: 0,
          totalIngresosARS: 0,
          totalIngresosUSD: 0,
          totalEgresosARS: 0,
          totalEgresosUSD: 0,
          balanceARS: 0,
          balanceUSD: 0,
        },
      });
    }

    const allRecurringCategoryIds = recurringCategories.map((c) => c.id);

    // Resolver el grupo (categoría padre o sí misma) de forma SEGURA para cada subcategoría
    const resolveGroup = (category) => ({
      groupId:
        category.parentCategoryId && category.parentCategory
          ? category.parentCategory.id
          : category.id,
      groupName:
        category.parentCategoryId && category.parentCategory
          ? category.parentCategory.name
          : category.name,
      groupType:
        category.parentCategoryId && category.parentCategory
          ? category.parentCategory.type
          : category.type,
    });

    // Mapa: categoryId → { groupId, groupName, groupType }
    const categoryGroupMap = new Map(
      recurringCategories.map((cat) => [cat.id, resolveGroup(cat)]),
    );

    // IDs de las categorías padre de las subcategorías recurrentes
    // (para capturar transacciones asignadas directamente a la categoría padre)
    const parentCategoryIds = [
      ...new Set(
        recurringCategories
          .filter((cat) => cat.parentCategoryId && cat.parentCategory)
          .map((cat) => cat.parentCategoryId),
      ),
    ];

    // Agregar las categorías padre al mapa con groupId = sí mismas
    if (parentCategoryIds.length > 0) {
      const parentCategories = await models.Category.findAll({
        where: { id: { [Op.in]: parentCategoryIds } },
        attributes: ["id", "name", "type"],
      });
      parentCategories.forEach((parent) => {
        if (!categoryGroupMap.has(parent.id)) {
          categoryGroupMap.set(parent.id, {
            groupId: parent.id,
            groupName: parent.name,
            groupType: parent.type,
          });
        }
      });
    }

    // Todos los IDs a buscar en transacciones: subcategorías recurrentes + padres de esas subcategorías
    const allCategoryIdsToQuery = [
      ...allRecurringCategoryIds,
      ...parentCategoryIds,
    ];

    // ── 2. Una sola query para TODAS las transacciones del mes actual ─────────
    const transactions = await models.Transaction.findAll({
      where: {
        categoryId: { [Op.in]: allCategoryIdsToQuery },
        date: { [Op.between]: [firstDayStr, lastDayStr] },
      },
      attributes: ["id", "amount", "currency", "date", "categoryId"],
    });

    // ── 3. Agrupar transacciones por grupo (categoría padre) ──────────────────
    const groupedMap = new Map();

    const ensureGroup = (groupId, groupName, groupType) => {
      if (!groupedMap.has(groupId)) {
        groupedMap.set(groupId, {
          categoryId: groupId,
          categoryName: groupName,
          type: groupType,
          lastAmountARS: 0,
          lastAmountUSD: 0,
          lastAmount: 0,
          projectedAmountARS: 0,
          projectedAmountUSD: 0,
          projectedAmount: 0,
          transactionCount: 0,
          lastDate: null,
        });
      }
      return groupedMap.get(groupId);
    };

    // Inicializar todos los grupos con $0 (para que aparezcan aunque no tengan transacciones este mes)
    recurringCategories.forEach((cat) => {
      const { groupId, groupName, groupType } = categoryGroupMap.get(cat.id);
      ensureGroup(groupId, groupName, groupType);
    });

    transactions.forEach((tx) => {
      const group = categoryGroupMap.get(tx.categoryId);
      if (!group) return;
      const entry = ensureGroup(
        group.groupId,
        group.groupName,
        group.groupType,
      );

      const amount = parseFloat(tx.amount);
      const currency = tx.currency || "ARS";

      if (currency === "USD") {
        entry.lastAmountUSD += amount;
        entry.projectedAmountUSD += amount;
      } else {
        entry.lastAmountARS += amount;
        entry.projectedAmountARS += amount;
      }
      entry.lastAmount += amount;
      entry.projectedAmount += amount;
      entry.transactionCount += 1;

      if (!entry.lastDate || tx.date > entry.lastDate) {
        entry.lastDate = tx.date;
      }
    });

    const projections = Array.from(groupedMap.values());
    // Mapa actualizado para lookups de charges y TC expenses
    const projectionsByGroupId = new Map(
      projections.map((p) => [p.categoryId, p]),
    );

    // ── 4. Débitos automáticos (CreditCardRecurringCharge) ────────────────────
    const recurringCharges = await models.CreditCardRecurringCharge.findAll({
      where: {
        isActive: true,
        categoryId: { [Op.in]: allRecurringCategoryIds },
      },
      include: [
        {
          model: models.Category,
          as: "category",
          attributes: ["id", "name", "type", "parentCategoryId"],
          required: false,
          include: [
            {
              model: models.Category,
              as: "parentCategory",
              attributes: ["id", "name", "type"],
              required: false,
            },
          ],
        },
      ],
    });

    recurringCharges.forEach((charge) => {
      if (!charge.category) return;
      const { groupId, groupName, groupType } = resolveGroup(charge.category);
      const entry = ensureGroup(groupId, groupName, groupType);

      const amount = parseFloat(charge.amount);
      const currency = charge.currency || "ARS";
      if (currency === "USD") {
        entry.lastAmountUSD += amount;
        entry.projectedAmountUSD += amount;
      } else {
        entry.lastAmountARS += amount;
        entry.projectedAmountARS += amount;
      }
      entry.lastAmount += amount;
      entry.projectedAmount += amount;
    });

    // ── 5. Gastos de TC en 1 cuota del mes actual (purchaseDate en mes actual) ─
    const singleInstallmentExpenses = await models.CreditCardExpense.findAll({
      where: {
        installments: 1,
        categoryId: { [Op.in]: allRecurringCategoryIds },
        purchaseDate: { [Op.between]: [firstDayStr, lastDayStr] },
      },
      include: [
        {
          model: models.Category,
          as: "category",
          attributes: ["id", "name", "type", "parentCategoryId"],
          required: false,
          include: [
            {
              model: models.Category,
              as: "parentCategory",
              attributes: ["id", "name", "type"],
              required: false,
            },
          ],
        },
      ],
      attributes: ["id", "totalAmount", "currency", "categoryId"],
    });

    singleInstallmentExpenses.forEach((expense) => {
      if (!expense.category) return;
      const { groupId, groupName, groupType } = resolveGroup(expense.category);
      const entry = ensureGroup(groupId, groupName, groupType);

      const amount = parseFloat(expense.totalAmount);
      const currency = expense.currency || "ARS";
      if (currency === "USD") {
        entry.lastAmountUSD += amount;
        entry.projectedAmountUSD += amount;
      } else {
        entry.lastAmountARS += amount;
        entry.projectedAmountARS += amount;
      }
      entry.lastAmount += amount;
      entry.projectedAmount += amount;
    });

    // ── 6. Proyección consolidada de Tarjetas de Crédito (próximo mes) ────────
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const targetCardMonth = nextMonthDate.getMonth() + 1;
    const targetCardYear = nextMonthDate.getFullYear();

    const openInstallments = await models.CreditCardInstallment.findAll({
      where: { isPaid: false },
      include: [
        {
          model: models.CreditCardExpense,
          as: "expense",
          required: true,
          attributes: ["id", "currency"],
        },
      ],
      attributes: [
        "id",
        "amount",
        "dueDate",
        "statementMonth",
        "statementYear",
        "paymentMonth",
        "paymentYear",
      ],
    });

    const installmentsForTargetPeriod = openInstallments.filter(
      (installment) => {
        const paymentPeriod = getPaymentPeriodForInstallment(installment);
        return (
          paymentPeriod.month === targetCardMonth &&
          paymentPeriod.year === targetCardYear
        );
      },
    );

    const paidPeriods = await models.CreditCardPayment.findAll({
      attributes: ["creditCardId", "paymentMonth", "paymentYear", "currency"],
    });

    const paidPeriodSet = new Set(
      paidPeriods
        .filter(
          (payment) =>
            payment.creditCardId &&
            payment.paymentMonth &&
            payment.paymentYear &&
            payment.currency,
        )
        .map(
          (payment) =>
            `${payment.creditCardId}-${getPeriodKey(
              payment.paymentMonth,
              payment.paymentYear,
            )}-${payment.currency}`,
        ),
    );

    const activeRecurringCharges =
      await models.CreditCardRecurringCharge.findAll({
        where: { isActive: true },
        attributes: ["amount", "currency", "creditCardId"],
      });

    const recurringChargesForTargetPeriod = activeRecurringCharges.filter(
      (charge) => {
        const paidKey = `${charge.creditCardId}-${getPeriodKey(
          targetCardMonth,
          targetCardYear,
        )}-${charge.currency || "ARS"}`;
        return !paidPeriodSet.has(paidKey);
      },
    );

    let projectedCardsARS = 0;
    let projectedCardsUSD = 0;

    installmentsForTargetPeriod.forEach((installment) => {
      const amount = parseFloat(installment.amount);
      const currency = installment.expense?.currency || "ARS";
      if (currency === "USD") {
        projectedCardsUSD += amount;
      } else {
        projectedCardsARS += amount;
      }
    });

    recurringChargesForTargetPeriod.forEach((charge) => {
      const amount = parseFloat(charge.amount);
      const currency = charge.currency || "ARS";
      if (currency === "USD") {
        projectedCardsUSD += amount;
      } else {
        projectedCardsARS += amount;
      }
    });

    if (projectedCardsARS > 0 || projectedCardsUSD > 0) {
      projections.push({
        categoryId: -1,
        categoryName: "Tarjetas de Crédito",
        type: "Egreso",
        lastAmountARS: projectedCardsARS,
        lastAmountUSD: projectedCardsUSD,
        lastAmount: projectedCardsARS + projectedCardsUSD,
        projectedAmountARS: projectedCardsARS,
        projectedAmountUSD: projectedCardsUSD,
        projectedAmount: projectedCardsARS + projectedCardsUSD,
        transactionCount: 0,
        lastDate: null,
      });
    }

    // ── 7. Calcular totales y responder ───────────────────────────────────────
    projections.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

    const totalIngresosARS = projections
      .filter((p) => p.type === "Ingreso")
      .reduce((s, p) => s + p.projectedAmountARS, 0);
    const totalIngresosUSD = projections
      .filter((p) => p.type === "Ingreso")
      .reduce((s, p) => s + p.projectedAmountUSD, 0);
    const totalEgresosARS = projections
      .filter((p) => p.type === "Egreso")
      .reduce((s, p) => s + p.projectedAmountARS, 0);
    const totalEgresosUSD = projections
      .filter((p) => p.type === "Egreso")
      .reduce((s, p) => s + p.projectedAmountUSD, 0);
    const totalIngresos = totalIngresosARS + totalIngresosUSD;
    const totalEgresos = totalEgresosARS + totalEgresosUSD;

    res.json({
      projections,
      summary: {
        totalIngresos,
        totalEgresos,
        balance: totalIngresos - totalEgresos,
        totalIngresosARS,
        totalIngresosUSD,
        totalEgresosARS,
        totalEgresosUSD,
        balanceARS: totalIngresosARS - totalEgresosARS,
        balanceUSD: totalIngresosUSD - totalEgresosUSD,
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
