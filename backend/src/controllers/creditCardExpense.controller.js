import { models } from "../models/index.js";
import { Op } from "sequelize";

// Función helper para calcular la fecha de vencimiento de una cuota
function calculateInstallmentDueDate(
  purchaseDate,
  creditCard,
  installmentNumber,
) {
  const purchase = new Date(purchaseDate + "T00:00:00");
  const dueDay = creditCard.dueDay;

  // Calcular el mes de vencimiento
  let dueMonth = purchase.getMonth() + installmentNumber;
  let dueYear = purchase.getFullYear();

  // Ajustar año si el mes supera diciembre
  while (dueMonth > 11) {
    dueMonth -= 12;
    dueYear += 1;
  }

  // Crear fecha de vencimiento
  let dueDate = new Date(dueYear, dueMonth, dueDay);

  // Si el día no existe en ese mes (ej: 31 de febrero), usar el último día del mes
  if (dueDate.getMonth() !== dueMonth) {
    dueDate = new Date(dueYear, dueMonth + 1, 0);
  }

  return dueDate.toISOString().split("T")[0];
}

export async function createCreditCardExpense(req, res) {
  try {
    const {
      description,
      totalAmount,
      installments,
      purchaseDate,
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
      where: { id: categoryId },
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
      purchaseDate: purchaseDate || new Date().toISOString().split("T")[0],
      currency: currency || "ARS",
      creditCardId,
      categoryId,
      userId,
    });

    // Calcular monto por cuota
    const installmentAmount = (parseFloat(totalAmount) / installments).toFixed(
      2,
    );

    // Crear las cuotas
    const installmentsData = [];
    for (let i = 1; i <= installments; i++) {
      const dueDate = calculateInstallmentDueDate(
        expense.purchaseDate,
        creditCard,
        i,
      );

      installmentsData.push({
        installmentNumber: i,
        amount: installmentAmount,
        dueDate,
        isPaid: false,
        expenseId: expense.id,
      });
    }

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
    const { creditCardId, fromDate, toDate } = req.query;

    const where = {};

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

    res.json({ expenses });
  } catch (err) {
    console.error("Error en getCreditCardExpenses:", err);
    res.status(500).json({ error: "Error al obtener gastos con tarjeta" });
  }
}

export async function updateCreditCardExpense(req, res) {
  try {
    const { id } = req.params;
    const { description, categoryId } = req.body;

    const expense = await models.CreditCardExpense.findOne({ where: { id } });

    if (!expense) {
      return res.status(404).json({ error: "Gasto no encontrado" });
    }

    // Solo permitir editar descripción y categoría (no monto ni cuotas)
    if (description !== undefined) expense.description = description;
    if (categoryId !== undefined) {
      const category = await models.Category.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }
      expense.categoryId = categoryId;
    }

    await expense.save();

    res.json({
      message: "Gasto actualizado exitosamente",
      expense,
    });
  } catch (err) {
    console.error("Error en updateCreditCardExpense:", err);
    res.status(500).json({ error: "Error al actualizar gasto" });
  }
}

export async function deleteCreditCardExpense(req, res) {
  try {
    const { id } = req.params;

    const expense = await models.CreditCardExpense.findOne({ where: { id } });

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

    const installment = await models.CreditCardInstallment.findOne({
      where: { id },
    });

    if (!installment) {
      return res.status(404).json({ error: "Cuota no encontrada" });
    }

    installment.isPaid = true;
    installment.paidDate = paidDate || new Date().toISOString().split("T")[0];

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
