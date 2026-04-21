import { models } from "../models/index.js";
import { Op } from "sequelize";
import {
  buildDueDateFromPaymentPeriod,
  deriveStatementPeriodFromDueDate,
  getInstallmentPeriods,
} from "../utils/creditCardPeriods.js";

function buildInstallmentAmounts(totalAmount, installments) {
  const totalInCents = Math.round(parseFloat(totalAmount) * 100);
  const baseInstallment = Math.floor(totalInCents / installments);
  const amounts = [];
  let accumulated = 0;

  for (let index = 0; index < installments; index += 1) {
    let installmentAmount = baseInstallment;

    if (index === installments - 1) {
      installmentAmount = totalInCents - accumulated;
    }

    accumulated += installmentAmount;
    amounts.push((installmentAmount / 100).toFixed(2));
  }

  return amounts;
}

function buildInstallmentsData({
  expenseId,
  totalAmount,
  installments,
  firstStatementMonth,
  firstStatementYear,
  creditCard,
}) {
  const installmentAmounts = buildInstallmentAmounts(totalAmount, installments);

  return installmentAmounts.map((amount, index) => {
    const installmentNumber = index + 1;
    const { statementPeriod, paymentPeriod } = getInstallmentPeriods(
      firstStatementMonth,
      firstStatementYear,
      installmentNumber,
    );

    return {
      installmentNumber,
      amount,
      dueDate: buildDueDateFromPaymentPeriod(
        paymentPeriod.month,
        paymentPeriod.year,
        creditCard.dueDay,
      ),
      statementMonth: statementPeriod.month,
      statementYear: statementPeriod.year,
      paymentMonth: paymentPeriod.month,
      paymentYear: paymentPeriod.year,
      status: "projected",
      isPaid: false,
      expenseId,
    };
  });
}

export async function createCreditCardExpense(req, res) {
  try {
    const {
      description,
      totalAmount,
      installments,
      purchaseDate,
      firstStatementMonth,
      firstStatementYear,
      currency,
      creditCardId,
      categoryId,
    } = req.body;
    const userId = req.user.userId;

    if (!description || !totalAmount || !creditCardId || !categoryId) {
      return res.status(400).json({
        error: "Descripción, monto total, tarjeta y categoría son requeridos",
      });
    }

    if (totalAmount <= 0) {
      return res.status(400).json({ error: "El monto debe ser mayor a 0" });
    }

    if (installments < 1) {
      return res.status(400).json({ error: "Las cuotas deben ser al menos 1" });
    }

    const purchaseDateValue =
      purchaseDate || new Date().toISOString().split("T")[0];
    const purchase = new Date(`${purchaseDateValue}T00:00:00`);
    const fallbackStatementPeriod = {
      month: purchase.getMonth() + 1,
      year: purchase.getFullYear(),
    };

    // Verificar que la tarjeta existe
    const creditCard = await models.CreditCard.findOne({
      where: { id: creditCardId },
    });

    if (!creditCard) {
      return res
        .status(404)
        .json({ error: "Tarjeta de crédito no encontrada" });
    }

    // Verificar que la categoría existe
    const category = await models.Category.findOne({
      where: { id: categoryId, userId },
    });

    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    // Buscar o crear el medio de pago para esta tarjeta
    let paymentMethod = await models.PaymentMethod.findOne({
      where: {
        name: `${creditCard.name} - ${creditCard.bank}`,
        type: "Tarjeta",
        userId,
      },
    });

    if (!paymentMethod) {
      paymentMethod = await models.PaymentMethod.create({
        name: `${creditCard.name} - ${creditCard.bank}`,
        type: "Tarjeta",
        userId,
      });
    }

    // Crear el gasto
    const expense = await models.CreditCardExpense.create({
      description,
      totalAmount,
      installments: installments || 1,
      purchaseDate: purchaseDateValue,
      firstStatementMonth:
        parseInt(firstStatementMonth, 10) || fallbackStatementPeriod.month,
      firstStatementYear:
        parseInt(firstStatementYear, 10) || fallbackStatementPeriod.year,
      currency: currency || "ARS",
      creditCardId,
      categoryId,
      userId,
    });

    // Crear las cuotas
    const installmentsData = buildInstallmentsData({
      expenseId: expense.id,
      totalAmount,
      installments: installments || 1,
      firstStatementMonth: expense.firstStatementMonth,
      firstStatementYear: expense.firstStatementYear,
      creditCard,
    });

    await models.CreditCardInstallment.bulkCreate(installmentsData);

    // Obtener el gasto con sus cuotas
    const expenseWithInstallments = await models.CreditCardExpense.findOne({
      where: { id: expense.id },
      include: [
        {
          model: models.CreditCardInstallment,
          as: "installmentsList",
          order: [["installmentNumber", "ASC"]],
        },
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

    res.status(201).json({
      message: "Gasto con tarjeta creado exitosamente",
      expense: expenseWithInstallments,
    });
  } catch (err) {
    console.error("Error en createCreditCardExpense:", err);
    res.status(500).json({ error: "Error al crear gasto con tarjeta" });
  }
}

export async function getCreditCardExpenses(req, res) {
  try {
    const { creditCardId, fromDate, toDate, includePaid } = req.query;
    const userId = req.user.userId;

    const where = { userId };

    if (creditCardId) {
      where.creditCardId = creditCardId;
    }

    if (fromDate || toDate) {
      where.purchaseDate = {};
      if (fromDate) where.purchaseDate[Op.gte] = fromDate;
      if (toDate) where.purchaseDate[Op.lte] = toDate;
    }

    const expenses = await models.CreditCardExpense.findAll({
      where,
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
        {
          model: models.CreditCardInstallment,
          as: "installmentsList",
          order: [["installmentNumber", "ASC"]],
        },
      ],
      order: [["purchaseDate", "DESC"]],
    });

    const filteredExpenses =
      includePaid === "true"
        ? expenses
        : expenses.filter((expense) =>
            (expense.installmentsList || []).some(
              (installment) => !installment.isPaid,
            ),
          );

    res.json({ expenses: filteredExpenses });
  } catch (err) {
    console.error("Error en getCreditCardExpenses:", err);
    res.status(500).json({ error: "Error al obtener gastos con tarjeta" });
  }
}

export async function updateCreditCardExpense(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const {
      description,
      totalAmount,
      installments,
      purchaseDate,
      firstStatementMonth,
      firstStatementYear,
      currency,
      creditCardId,
      categoryId,
    } = req.body;

    const expense = await models.CreditCardExpense.findOne({
      where: { id, userId },
      include: [
        {
          model: models.CreditCardInstallment,
          as: "installmentsList",
        },
      ],
    });

    if (!expense) {
      return res.status(404).json({ error: "Gasto no encontrado" });
    }

    const hasPaidInstallments = (expense.installmentsList || []).some(
      (installment) => installment.isPaid,
    );

    if (description !== undefined) expense.description = description;
    if (categoryId !== undefined) {
      const category = await models.Category.findOne({
        where: { id: categoryId, userId },
      });
      if (!category) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }
      expense.categoryId = categoryId;
    }

    const structuralFieldsProvided = [
      totalAmount,
      installments,
      purchaseDate,
      firstStatementMonth,
      firstStatementYear,
      currency,
      creditCardId,
    ].some((value) => value !== undefined);

    if (hasPaidInstallments && structuralFieldsProvided) {
      return res.status(400).json({
        error:
          "No se pueden recalcular monto, cuotas o período inicial si ya hay cuotas pagadas",
      });
    }

    let creditCard = null;

    if (creditCardId !== undefined) {
      creditCard = await models.CreditCard.findOne({
        where: { id: creditCardId },
      });

      if (!creditCard) {
        return res
          .status(404)
          .json({ error: "Tarjeta de crédito no encontrada" });
      }

      expense.creditCardId = creditCardId;
    } else {
      creditCard = await models.CreditCard.findOne({
        where: { id: expense.creditCardId },
      });
    }

    if (totalAmount !== undefined) expense.totalAmount = totalAmount;
    if (installments !== undefined) expense.installments = installments;
    if (purchaseDate !== undefined) expense.purchaseDate = purchaseDate;
    if (currency !== undefined) expense.currency = currency;
    if (firstStatementMonth !== undefined) {
      expense.firstStatementMonth = parseInt(firstStatementMonth, 10);
    }
    if (firstStatementYear !== undefined) {
      expense.firstStatementYear = parseInt(firstStatementYear, 10);
    }

    if (!expense.firstStatementMonth || !expense.firstStatementYear) {
      const derivedPeriod = deriveStatementPeriodFromDueDate(
        expense.installmentsList?.[0]?.dueDate || expense.purchaseDate,
      );
      expense.firstStatementMonth = derivedPeriod.month;
      expense.firstStatementYear = derivedPeriod.year;
    }

    await expense.save();

    if (!hasPaidInstallments && structuralFieldsProvided) {
      await models.CreditCardInstallment.destroy({
        where: { expenseId: expense.id },
      });

      const installmentsData = buildInstallmentsData({
        expenseId: expense.id,
        totalAmount: expense.totalAmount,
        installments: expense.installments,
        firstStatementMonth: expense.firstStatementMonth,
        firstStatementYear: expense.firstStatementYear,
        creditCard,
      });

      await models.CreditCardInstallment.bulkCreate(installmentsData);
    }

    const updatedExpense = await models.CreditCardExpense.findOne({
      where: { id: expense.id, userId },
      include: [
        {
          model: models.CreditCardInstallment,
          as: "installmentsList",
          order: [["installmentNumber", "ASC"]],
        },
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

    res.json({
      message: "Gasto actualizado exitosamente",
      expense: updatedExpense,
    });
  } catch (err) {
    console.error("Error en updateCreditCardExpense:", err);
    res.status(500).json({ error: "Error al actualizar gasto" });
  }
}

export async function deleteCreditCardExpense(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const expense = await models.CreditCardExpense.findOne({
      where: { id, userId },
    });

    if (!expense) {
      return res.status(404).json({ error: "Gasto no encontrado" });
    }

    // Las cuotas se eliminarán en cascada
    await expense.destroy();

    res.json({ message: "Gasto eliminado exitosamente" });
  } catch (err) {
    console.error("Error en deleteCreditCardExpense:", err);
    res.status(500).json({ error: "Error al eliminar gasto" });
  }
}

// Marcar una cuota como pagada
export async function markInstallmentAsPaid(req, res) {
  try {
    const { id } = req.params;
    const { paidDate } = req.body;
    const userId = req.user.userId;

    const installment = await models.CreditCardInstallment.findOne({
      where: { id },
      include: [
        {
          model: models.CreditCardExpense,
          as: "expense",
          required: true,
          where: { userId },
        },
      ],
    });

    if (!installment) {
      return res.status(404).json({ error: "Cuota no encontrada" });
    }

    installment.isPaid = true;
    installment.paidDate = paidDate || new Date().toISOString().split("T")[0];
    installment.status = "paid";

    await installment.save();

    res.json({
      message: "Cuota marcada como pagada",
      installment,
    });
  } catch (err) {
    console.error("Error en markInstallmentAsPaid:", err);
    res.status(500).json({ error: "Error al marcar cuota como pagada" });
  }
}
