import { models } from "../models/index.js";
import { Op } from "sequelize";
import {
  addMonthsToPeriod,
  getPaymentPeriodForInstallment,
  getPeriodKey,
} from "../utils/creditCardPeriods.js";

function serializeInstallment(installment) {
  return {
    id: installment.id,
    amount: parseFloat(installment.amount),
    currency: installment.expense.currency || "ARS",
    dueDate: installment.dueDate,
    description: installment.expense.description,
    installmentNumber: installment.installmentNumber,
    totalInstallments: installment.expense.installments,
    cardName: installment.expense.creditCard.name,
    cardBank: installment.expense.creditCard.bank,
    cardBrand: installment.expense.creditCard.brand,
    categoryName: installment.expense.category?.name || "Sin categoría",
  };
}

async function getOpenInstallmentsForPeriod({
  userId,
  creditCardId,
  month,
  year,
  currency,
}) {
  const installments = await models.CreditCardInstallment.findAll({
    where: { isPaid: false },
    include: [
      {
        model: models.CreditCardExpense,
        as: "expense",
        required: true,
        where: {
          userId,
          ...(creditCardId ? { creditCardId } : {}),
          ...(currency ? { currency } : {}),
        },
        include: [
          {
            model: models.CreditCard,
            as: "creditCard",
            attributes: ["id", "name", "bank", "brand", "lastFourDigits"],
          },
          {
            model: models.Category,
            as: "category",
            attributes: ["id", "name", "type"],
          },
        ],
      },
    ],
    order: [["dueDate", "ASC"]],
  });

  return installments.filter((installment) => {
    const paymentPeriod = getPaymentPeriodForInstallment(installment);
    return paymentPeriod.month === month && paymentPeriod.year === year;
  });
}

async function getPaidPeriodSet({ userId }) {
  const payments = await models.CreditCardPayment.findAll({
    where: { userId },
    attributes: ["creditCardId", "paymentMonth", "paymentYear", "currency"],
  });

  return new Set(
    payments
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
}

export async function getProjections(req, res) {
  try {
    const { month, year, creditCardId, currency } = req.query;
    const userId = req.user.userId;

    const currentDate = new Date();
    const nextMonthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );
    const targetMonth = month
      ? parseInt(month, 10)
      : nextMonthDate.getMonth() + 1;
    const targetYear = year ? parseInt(year, 10) : nextMonthDate.getFullYear();

    const installments = await getOpenInstallmentsForPeriod({
      userId,
      creditCardId,
      month: targetMonth,
      year: targetYear,
      currency,
    });

    const recurringChargesWhere = { userId, isActive: true };
    if (creditCardId) {
      recurringChargesWhere.creditCardId = creditCardId;
    }
    if (currency) {
      recurringChargesWhere.currency = currency;
    }

    const recurringCharges = await models.CreditCardRecurringCharge.findAll({
      where: recurringChargesWhere,
      include: [
        {
          model: models.CreditCard,
          as: "creditCard",
          attributes: ["id", "name", "bank", "lastFourDigits"],
        },
        {
          model: models.Category,
          as: "category",
          attributes: ["id", "name", "type"],
        },
      ],
    });

    const paidPeriods = await getPaidPeriodSet({ userId });
    const filteredRecurringCharges = recurringCharges.filter((charge) => {
      const paidKey = `${charge.creditCardId}-${getPeriodKey(
        targetMonth,
        targetYear,
      )}-${charge.currency || "ARS"}`;
      return !paidPeriods.has(paidKey);
    });

    const totals = {
      installmentsARS: 0,
      installmentsUSD: 0,
      recurringChargesARS: 0,
      recurringChargesUSD: 0,
    };

    installments.forEach((installment) => {
      const amount = parseFloat(installment.amount);
      const installmentCurrency = installment.expense.currency || "ARS";
      if (installmentCurrency === "USD") {
        totals.installmentsUSD += amount;
      } else {
        totals.installmentsARS += amount;
      }
    });

    filteredRecurringCharges.forEach((charge) => {
      const amount = parseFloat(charge.amount);
      const chargeCurrency = charge.currency || "ARS";
      if (chargeCurrency === "USD") {
        totals.recurringChargesUSD += amount;
      } else {
        totals.recurringChargesARS += amount;
      }
    });

    res.json({
      projections: {
        month: targetMonth,
        year: targetYear,
        installments: installments.map(serializeInstallment),
        recurringCharges: filteredRecurringCharges,
        totals: {
          installmentsARS: totals.installmentsARS.toFixed(2),
          installmentsUSD: totals.installmentsUSD.toFixed(2),
          recurringChargesARS: totals.recurringChargesARS.toFixed(2),
          recurringChargesUSD: totals.recurringChargesUSD.toFixed(2),
          totalARS: (
            totals.installmentsARS + totals.recurringChargesARS
          ).toFixed(2),
          totalUSD: (
            totals.installmentsUSD + totals.recurringChargesUSD
          ).toFixed(2),
        },
      },
    });
  } catch (err) {
    console.error("Error en getProjections:", err);
    res.status(500).json({ error: "Error al obtener proyecciones" });
  }
}

export async function createCreditCardPayment(req, res) {
  try {
    const {
      amount,
      paymentDate,
      currency,
      notes,
      creditCardId,
      paymentMethodId,
      paymentMonth,
      paymentYear,
    } = req.body;
    const userId = req.user.userId;

    if (
      !amount ||
      !creditCardId ||
      !paymentMonth ||
      !paymentYear ||
      !currency
    ) {
      return res.status(400).json({
        error: "Monto, tarjeta, moneda y período de pago son requeridos",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "El monto debe ser mayor a 0" });
    }

    const creditCard = await models.CreditCard.findOne({
      where: { id: creditCardId, userId },
    });

    if (!creditCard) {
      return res
        .status(404)
        .json({ error: "Tarjeta de crédito no encontrada" });
    }

    const normalizedPaymentMonth = parseInt(paymentMonth, 10);
    const normalizedPaymentYear = parseInt(paymentYear, 10);
    const statementPeriod = addMonthsToPeriod(
      normalizedPaymentMonth,
      normalizedPaymentYear,
      -1,
    );

    const existingPayment = await models.CreditCardPayment.findOne({
      where: {
        creditCardId,
        userId,
        currency,
        paymentMonth: normalizedPaymentMonth,
        paymentYear: normalizedPaymentYear,
      },
    });

    if (existingPayment) {
      return res.status(400).json({
        error: "Ya existe un pago registrado para esa tarjeta, mes y moneda",
      });
    }

    const installmentsToPay = await getOpenInstallmentsForPeriod({
      userId,
      creditCardId,
      month: normalizedPaymentMonth,
      year: normalizedPaymentYear,
      currency,
    });

    const recurringCharges = await models.CreditCardRecurringCharge.findAll({
      where: {
        userId,
        creditCardId,
        isActive: true,
        currency,
      },
    });

    if (installmentsToPay.length === 0 && recurringCharges.length === 0) {
      return res.status(400).json({
        error: "No hay consumos pendientes para ese período",
      });
    }

    let category = await models.Category.findOne({
      where: {
        name: "Tarjetas de credito",
        type: "Egreso",
        userId,
      },
    });

    if (!category) {
      category = await models.Category.create({
        name: "Tarjetas de credito",
        type: "Egreso",
        userId,
      });
    }

    const transaction = await models.Transaction.create({
      amount,
      date: paymentDate || new Date().toISOString().split("T")[0],
      description: `Pago ${creditCard.name} (${creditCard.bank})`,
      type: "Egreso",
      currency,
      categoryId: category.id,
      paymentMethodId: paymentMethodId || null,
      userId,
    });

    const payment = await models.CreditCardPayment.create({
      amount,
      paymentDate: paymentDate || new Date().toISOString().split("T")[0],
      statementMonth: statementPeriod.month,
      statementYear: statementPeriod.year,
      paymentMonth: normalizedPaymentMonth,
      paymentYear: normalizedPaymentYear,
      currency,
      notes: notes || null,
      coveredInstallmentIds: installmentsToPay.map(
        (installment) => installment.id,
      ),
      creditCardId,
      transactionId: transaction.id,
      userId,
    });

    if (installmentsToPay.length > 0) {
      await models.CreditCardInstallment.update(
        {
          isPaid: true,
          paidDate: paymentDate || new Date().toISOString().split("T")[0],
          status: "paid",
        },
        {
          where: {
            id: {
              [Op.in]: installmentsToPay.map((installment) => installment.id),
            },
          },
        },
      );
    }

    res.status(201).json({
      message: "Pago de tarjeta registrado exitosamente",
      payment,
      transaction,
    });
  } catch (err) {
    console.error("Error en createCreditCardPayment:", err);
    res.status(500).json({ error: "Error al registrar pago de tarjeta" });
  }
}

export async function getCreditCardPayments(req, res) {
  try {
    const { creditCardId, fromDate, toDate } = req.query;
    const userId = req.user.userId;

    const where = { userId };

    if (creditCardId) {
      where.creditCardId = creditCardId;
    }

    if (fromDate || toDate) {
      where.paymentDate = {};
      if (fromDate) where.paymentDate[Op.gte] = fromDate;
      if (toDate) where.paymentDate[Op.lte] = toDate;
    }

    const payments = await models.CreditCardPayment.findAll({
      where,
      include: [
        {
          model: models.CreditCard,
          as: "creditCard",
          attributes: ["id", "name", "bank", "lastFourDigits"],
        },
        {
          model: models.Transaction,
          as: "transaction",
          attributes: ["id", "amount", "date", "description"],
        },
      ],
      order: [["paymentDate", "DESC"]],
    });

    res.json({ payments });
  } catch (err) {
    console.error("Error en getCreditCardPayments:", err);
    res.status(500).json({ error: "Error al obtener pagos de tarjeta" });
  }
}

export async function getCreditCardSummary(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const creditCard = await models.CreditCard.findOne({
      where: { id, userId },
    });

    if (!creditCard) {
      return res
        .status(404)
        .json({ error: "Tarjeta de crédito no encontrada" });
    }

    const pendingInstallments = await models.CreditCardInstallment.findAll({
      where: { isPaid: false },
      include: [
        {
          model: models.CreditCardExpense,
          as: "expense",
          where: { creditCardId: id, userId },
          attributes: ["id", "description", "totalAmount", "currency"],
        },
      ],
      order: [["dueDate", "ASC"]],
    });

    const activeRecurringCharges =
      await models.CreditCardRecurringCharge.findAll({
        where: {
          creditCardId: id,
          userId,
          isActive: true,
        },
      });

    const totalPendingDebt = pendingInstallments.reduce(
      (sum, inst) => sum + parseFloat(inst.amount),
      0,
    );

    const monthlyRecurringTotal = activeRecurringCharges.reduce(
      (sum, charge) => sum + parseFloat(charge.amount),
      0,
    );

    const nextDueInstallment = pendingInstallments[0] || null;

    res.json({
      summary: {
        creditCard,
        totalPendingDebt: totalPendingDebt.toFixed(2),
        monthlyRecurringTotal: monthlyRecurringTotal.toFixed(2),
        pendingInstallmentsCount: pendingInstallments.length,
        activeRecurringChargesCount: activeRecurringCharges.length,
        nextDueDate: nextDueInstallment?.dueDate || null,
        nextDueAmount: nextDueInstallment?.amount || 0,
      },
    });
  } catch (err) {
    console.error("Error en getCreditCardSummary:", err);
    res.status(500).json({ error: "Error al obtener resumen de tarjeta" });
  }
}

export async function deleteCreditCardPayment(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const payment = await models.CreditCardPayment.findOne({
      where: { id, userId },
    });

    if (!payment) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }

    const transactionId = payment.transactionId;
    const coveredInstallmentIds = Array.isArray(payment.coveredInstallmentIds)
      ? payment.coveredInstallmentIds
      : [];

    if (coveredInstallmentIds.length > 0) {
      await models.CreditCardInstallment.update(
        {
          isPaid: false,
          paidDate: null,
          status: "projected",
        },
        {
          where: {
            id: {
              [Op.in]: coveredInstallmentIds,
            },
          },
        },
      );
    }

    await payment.destroy();

    if (transactionId) {
      await models.Transaction.destroy({
        where: { id: transactionId },
      });
    }

    res.json({ message: "Pago eliminado exitosamente" });
  } catch (err) {
    console.error("Error en deleteCreditCardPayment:", err);
    res.status(500).json({ error: "Error al eliminar pago" });
  }
}
