import { models } from "../models/index.js";
import { Op } from "sequelize";

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
          ],
        },
      ],
      order: [["dueDate", "ASC"]],
    });

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
      const dueDate = new Date(installment.dueDate);
      const monthKey = `${dueDate.getFullYear()}-${String(
        dueDate.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          year: dueDate.getFullYear(),
          monthNumber: dueDate.getMonth() + 1,
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

    // Agregar débitos automáticos a cada mes separados por moneda
    const recurringChargesARS = recurringCharges
      .filter((c) => !c.currency || c.currency === "ARS")
      .reduce((sum, charge) => sum + parseFloat(charge.amount), 0);

    const recurringChargesUSD = recurringCharges
      .filter((c) => c.currency === "USD")
      .reduce((sum, charge) => sum + parseFloat(charge.amount), 0);

    Object.keys(grouped).forEach((monthKey) => {
      grouped[monthKey].recurringChargesARS = recurringChargesARS;
      grouped[monthKey].recurringChargesUSD = recurringChargesUSD;
      grouped[monthKey].totalARS += recurringChargesARS;
      grouped[monthKey].totalUSD += recurringChargesUSD;
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
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    await installment.update({
      isPaid: true,
      paidDate,
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
