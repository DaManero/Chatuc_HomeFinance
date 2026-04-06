import { models } from "../models/index.js";
import { Op } from "sequelize";
import {
  getPaymentPeriodForInstallment,
  getPeriodKey,
} from "../utils/creditCardPeriods.js";

export async function getPendingInstallments(req, res) {
  try {
    const userId = req.user.userId;

    // Obtener cuotas pendientes
    const installments = await models.CreditCardInstallment.findAll({
      where: {
        isPaid: false,
      },
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
              attributes: ["id", "name", "bank", "brand"],
            },
            {
              model: models.Category,
              as: "category",
              attributes: ["id", "name"],
            },
          ],
          attributes: [
            "id",
            "description",
            "totalAmount",
            "installments",
            "purchaseDate",
            "currency",
          ],
        },
      ],
      order: [
        ["paymentYear", "ASC"],
        ["paymentMonth", "ASC"],
        ["dueDate", "ASC"],
      ],
    });

    const payments = await models.CreditCardPayment.findAll({
      where: { userId },
      attributes: ["creditCardId", "paymentMonth", "paymentYear", "currency"],
    });

    const paidPeriods = new Set(
      payments
        .filter(
          (payment) =>
            payment.paymentMonth && payment.paymentYear && payment.currency,
        )
        .map(
          (payment) =>
            `${payment.creditCardId}-${getPeriodKey(
              payment.paymentMonth,
              payment.paymentYear,
            )}-${payment.currency}`,
        ),
    );

    // Obtener débitos automáticos activos
    const recurringCharges = await models.CreditCardRecurringCharge.findAll({
      where: {
        userId,
        isActive: true,
      },
      include: [
        {
          model: models.CreditCard,
          as: "creditCard",
          attributes: ["id", "name", "bank", "brand"],
        },
      ],
    });

    // Agrupar por mes
    const grouped = installments.reduce((acc, installment) => {
      const paymentPeriod = getPaymentPeriodForInstallment(installment);
      const monthKey = getPeriodKey(paymentPeriod.month, paymentPeriod.year);

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          year: paymentPeriod.year,
          monthNumber: paymentPeriod.month,
          installments: [],
          totalARS: 0,
          totalUSD: 0,
          recurringChargesARS: 0,
          recurringChargesUSD: 0,
        };
      }

      const currency = installment.expense.currency || "ARS";
      const amount = parseFloat(installment.amount);

      acc[monthKey].installments.push({
        id: installment.id,
        installmentNumber: installment.installmentNumber,
        amount: amount,
        currency: currency,
        dueDate: installment.dueDate,
        paymentMonth: paymentPeriod.month,
        paymentYear: paymentPeriod.year,
        cardName: installment.expense.creditCard.name,
        cardBank: installment.expense.creditCard.bank,
        cardBrand: installment.expense.creditCard.brand,
        description: installment.expense.description,
        categoryName: installment.expense.category?.name || "Sin categoría",
        totalInstallments: installment.expense.installments,
        expenseId: installment.expense.id,
      });

      if (currency === "USD") {
        acc[monthKey].totalUSD += amount;
      } else {
        acc[monthKey].totalARS += amount;
      }

      return acc;
    }, {});

    Object.keys(grouped).forEach((monthKey) => {
      const monthGroup = grouped[monthKey];

      recurringCharges.forEach((charge) => {
        const currency = charge.currency || "ARS";
        const paidKey = `${charge.creditCardId}-${monthKey}-${currency}`;

        if (paidPeriods.has(paidKey)) {
          return;
        }

        const amount = parseFloat(charge.amount);
        if (currency === "USD") {
          monthGroup.recurringChargesUSD += amount;
          monthGroup.totalUSD += amount;
        } else {
          monthGroup.recurringChargesARS += amount;
          monthGroup.totalARS += amount;
        }
      });
    });

    // Convertir a array y ordenar por mes
    const result = Object.values(grouped).sort((a, b) => {
      return a.month.localeCompare(b.month);
    });

    res.json({ pendingInstallments: result });
  } catch (err) {
    console.error("Error en getPendingInstallments:", err);
    res.status(500).json({ error: "Error al obtener cuotas pendientes" });
  }
}

export async function markInstallmentAsPaid(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const installment = await models.CreditCardInstallment.findOne({
      where: { id },
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
            },
          ],
        },
      ],
    });

    if (!installment) {
      return res.status(404).json({ error: "Cuota no encontrada" });
    }

    if (installment.isPaid) {
      return res
        .status(400)
        .json({ error: "La cuota ya está marcada como pagada" });
    }

    const today = new Date();
    const paidDate = `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    await installment.update({
      isPaid: true,
      paidDate,
      status: "paid",
    });

    res.json({
      message: "Cuota marcada como pagada",
      installment,
    });
  } catch (err) {
    console.error("Error en markInstallmentAsPaid:", err);
    res.status(500).json({ error: "Error al marcar cuota como pagada" });
  }
}
