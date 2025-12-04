import { models } from "../models/index.js";
import { Op } from "sequelize";
import { sequelize } from "../config/db.js";

export async function getStatistics(req, res) {
  try {
    const userId = req.user.userId;
    const { months = 12 } = req.query; // Últimos N meses

    // Fecha de inicio (N meses atrás)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));
    startDate.setDate(1);

    // Obtener todas las transacciones del período (excluyendo tarjetas)
    const transactions = await models.Transaction.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: startDate.toISOString().split("T")[0],
        },
      },
      include: [
        {
          model: models.Category,
          as: "category",
          attributes: ["id", "name", "type"],
        },
        {
          model: models.PaymentMethod,
          as: "paymentMethod",
          attributes: ["id", "name", "type"],
        },
      ],
      order: [["date", "ASC"]],
    });

    // 1. BALANCE MENSUAL (incluye todos los movimientos de dinero, incluso pagos de tarjetas)
    const monthlyBalance = calculateMonthlyBalance(transactions);

    // 2. EGRESOS POR CATEGORÍA (todas las categorías)
    const expensesByCategory = calculateExpensesByCategory(transactions);

    // 3. INGRESOS POR CATEGORÍA
    const incomeByCategory = calculateIncomeByCategory(transactions);

    // 4. COMPARATIVA MENSUAL
    const monthlyComparison = calculateMonthlyComparison(transactions);

    // 5. GASTOS POR MONEDA
    const expensesByCurrency = calculateExpensesByCurrency(transactions);

    // 6. MEDIOS DE PAGO MÁS USADOS
    const paymentMethodStats = calculatePaymentMethodStats(transactions);

    // 7. INDICADORES CLAVE (KPIs)
    const kpis = calculateKPIs(transactions);

    // 8. DEUDA DE TARJETAS
    const creditCardDebt = await calculateCreditCardDebt(userId);

    // 9. TENDENCIA DE AHORRO
    const savingsTrend = calculateSavingsTrend(monthlyBalance);

    res.json({
      monthlyBalance,
      expensesByCategory,
      incomeByCategory,
      monthlyComparison,
      expensesByCurrency,
      paymentMethodStats,
      kpis,
      creditCardDebt,
      savingsTrend,
    });
  } catch (err) {
    console.error("Error en getStatistics:", err);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
}

// Calcular balance mensual (incluye TODOS los movimientos, incluso pagos de tarjetas)
function calculateMonthlyBalance(transactions) {
  const monthly = {};

  transactions.forEach((t) => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!monthly[monthKey]) {
      monthly[monthKey] = {
        month: monthKey,
        income: 0,
        expenses: 0,
        balance: 0,
        incomeARS: 0,
        incomeUSD: 0,
        expensesARS: 0,
        expensesUSD: 0,
      };
    }

    const amount = parseFloat(t.amount);
    const currency = t.currency || "ARS";

    if (t.type === "Ingreso") {
      monthly[monthKey].income += amount;
      if (currency === "USD") {
        monthly[monthKey].incomeUSD += amount;
      } else {
        monthly[monthKey].incomeARS += amount;
      }
    } else {
      monthly[monthKey].expenses += amount;
      if (currency === "USD") {
        monthly[monthKey].expensesUSD += amount;
      } else {
        monthly[monthKey].expensesARS += amount;
      }
    }

    monthly[monthKey].balance =
      monthly[monthKey].income - monthly[monthKey].expenses;
  });

  return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
}

// Calcular egresos por categoría
function calculateExpensesByCategory(transactions) {
  const categories = {};

  transactions
    .filter((t) => t.type === "Egreso")
    .filter((t) => !t.category?.name?.toLowerCase().includes("tarjeta")) // Excluir pagos de tarjetas
    .forEach((t) => {
      const categoryName = t.category?.name || "Sin categoría";
      const amount = parseFloat(t.amount);
      const currency = t.currency || "ARS";

      if (!categories[categoryName]) {
        categories[categoryName] = {
          name: categoryName,
          totalARS: 0,
          totalUSD: 0,
          total: 0,
          count: 0,
        };
      }

      if (currency === "USD") {
        categories[categoryName].totalUSD += amount;
      } else {
        categories[categoryName].totalARS += amount;
      }
      categories[categoryName].total += amount;
      categories[categoryName].count += 1;
    });

  return Object.values(categories).sort((a, b) => b.total - a.total);
}

// Calcular ingresos por categoría
function calculateIncomeByCategory(transactions) {
  const categories = {};

  transactions
    .filter((t) => t.type === "Ingreso")
    .forEach((t) => {
      const categoryName = t.category?.name || "Sin categoría";
      const amount = parseFloat(t.amount);
      const currency = t.currency || "ARS";

      if (!categories[categoryName]) {
        categories[categoryName] = {
          name: categoryName,
          totalARS: 0,
          totalUSD: 0,
          total: 0,
          count: 0,
        };
      }

      if (currency === "USD") {
        categories[categoryName].totalUSD += amount;
      } else {
        categories[categoryName].totalARS += amount;
      }
      categories[categoryName].total += amount;
      categories[categoryName].count += 1;
    });

  return Object.values(categories).sort((a, b) => b.total - a.total);
}

// Comparativa mensual (mes actual vs mes anterior)
function calculateMonthlyComparison(transactions) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const current = { income: 0, expenses: 0 };
  const previous = { income: 0, expenses: 0 };

  transactions
    .filter((t) => !t.category?.name?.toLowerCase().includes("tarjeta")) // Excluir pagos de tarjetas
    .forEach((t) => {
      const date = new Date(t.date);
      const amount = parseFloat(t.amount);

      if (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      ) {
        if (t.type === "Ingreso") {
          current.income += amount;
        } else {
          current.expenses += amount;
        }
      } else if (
        date.getMonth() === lastMonth &&
        date.getFullYear() === lastMonthYear
      ) {
        if (t.type === "Ingreso") {
          previous.income += amount;
        } else {
          previous.expenses += amount;
        }
      }
    });

  return {
    current: {
      ...current,
      balance: current.income - current.expenses,
    },
    previous: {
      ...previous,
      balance: previous.income - previous.expenses,
    },
    comparison: {
      incomeChange:
        previous.income > 0
          ? ((current.income - previous.income) / previous.income) * 100
          : 0,
      expensesChange:
        previous.expenses > 0
          ? ((current.expenses - previous.expenses) / previous.expenses) * 100
          : 0,
      balanceChange:
        previous.balance !== 0
          ? ((current.income - current.expenses - previous.balance) /
              Math.abs(previous.balance)) *
            100
          : 0,
    },
  };
}

// Gastos por moneda
function calculateExpensesByCurrency(transactions) {
  const byCurrency = {
    ARS: { total: 0, count: 0 },
    USD: { total: 0, count: 0 },
  };

  transactions
    .filter((t) => t.type === "Egreso")
    .filter((t) => !t.category?.name?.toLowerCase().includes("tarjeta")) // Excluir pagos de tarjetas
    .forEach((t) => {
      const currency = t.currency || "ARS";
      const amount = parseFloat(t.amount);
      byCurrency[currency].total += amount;
      byCurrency[currency].count += 1;
    });

  return byCurrency;
}

// Estadísticas de medios de pago
function calculatePaymentMethodStats(transactions) {
  const methods = {};

  transactions.forEach((t) => {
    const methodName = t.paymentMethod?.name || "Sin especificar";
    const amount = parseFloat(t.amount);

    if (!methods[methodName]) {
      methods[methodName] = {
        name: methodName,
        type: t.paymentMethod?.type || "Otro",
        total: 0,
        count: 0,
      };
    }

    methods[methodName].total += amount;
    methods[methodName].count += 1;
  });

  return Object.values(methods).sort((a, b) => b.total - a.total);
}

// KPIs principales
function calculateKPIs(transactions) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  });

  // Transacciones sin pagos de tarjetas para cálculo de categorías
  const currentMonthForCategories = currentMonthTransactions.filter(
    (t) => !t.category?.name?.toLowerCase().includes("tarjeta")
  );

  const totalIncome = currentMonthTransactions
    .filter((t) => t.type === "Ingreso")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Usar TODAS las transacciones para balance real (incluyendo pagos de tarjetas)
  const totalExpenses = currentMonthTransactions
    .filter((t) => t.type === "Egreso")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDay = now.getDate();
  const avgDailyExpense = totalExpenses / currentDay;

  return {
    totalIncome,
    totalExpenses,
    balance,
    savingsRate,
    avgDailyExpense,
    projectedMonthlyExpense: avgDailyExpense * daysInMonth,
    daysUntilZero:
      avgDailyExpense > 0 ? Math.floor(balance / avgDailyExpense) : 999,
  };
}

// Deuda de tarjetas
async function calculateCreditCardDebt(userId) {
  const pendingInstallments = await models.CreditCardInstallment.findAll({
    where: { isPaid: false },
    include: [
      {
        model: models.CreditCardExpense,
        as: "expense",
        required: true,
        include: [
          {
            model: models.CreditCard,
            as: "creditCard",
            required: true,
            where: { userId },
            attributes: ["id", "name"],
          },
        ],
      },
    ],
  });

  let totalDebtARS = 0;
  let totalDebtUSD = 0;
  const byCard = {};

  pendingInstallments.forEach((installment) => {
    const amount = parseFloat(installment.amount);
    const currency = installment.expense.currency || "ARS";
    const cardName = installment.expense.creditCard.name;

    if (currency === "USD") {
      totalDebtUSD += amount;
    } else {
      totalDebtARS += amount;
    }

    if (!byCard[cardName]) {
      byCard[cardName] = { name: cardName, totalARS: 0, totalUSD: 0 };
    }

    if (currency === "USD") {
      byCard[cardName].totalUSD += amount;
    } else {
      byCard[cardName].totalARS += amount;
    }
  });

  return {
    totalDebtARS,
    totalDebtUSD,
    totalInstallments: pendingInstallments.length,
    byCard: Object.values(byCard),
  };
}

// Tendencia de ahorro
function calculateSavingsTrend(monthlyBalance) {
  if (monthlyBalance.length < 2) {
    return { trend: "neutral", percentage: 0 };
  }

  const recent = monthlyBalance.slice(-3); // Últimos 3 meses
  const avgRecent =
    recent.reduce((sum, m) => sum + m.balance, 0) / recent.length;

  const older = monthlyBalance.slice(-6, -3); // 3 meses anteriores
  const avgOlder = older.length
    ? older.reduce((sum, m) => sum + m.balance, 0) / older.length
    : avgRecent;

  const change =
    avgOlder !== 0 ? ((avgRecent - avgOlder) / Math.abs(avgOlder)) * 100 : 0;

  return {
    trend: change > 5 ? "up" : change < -5 ? "down" : "neutral",
    percentage: change,
    avgRecent,
    avgOlder,
  };
}
