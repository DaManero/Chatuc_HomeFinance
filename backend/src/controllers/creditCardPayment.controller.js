import { models } from "../models/index.js";
import { Op } from "sequelize";

// Obtener proyecciones de gastos con tarjeta
export async function getProjections(req, res) {
  try {
    const { month, year, creditCardId } = req.query;

    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1)
      .toISOString()
      .split("T")[0];
    const endDate = new Date(targetYear, targetMonth + 1, 0)
      .toISOString()
      .split("T")[0];

    const where = {
      dueDate: {
        [Op.between]: [startDate, endDate],
      },
      isPaid: false,
    };

    // Obtener cuotas pendientes para el mes
    const installments = await models.CreditCardInstallment.findAll({
      where,
      include: [
        {
          model: models.CreditCardExpense,
          as: "expense",
          where: creditCardId ? { creditCardId } : {},
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
        },
      ],
      order: [["dueDate", "ASC"]],
    });

    // Obtener débitos automáticos activos
    const recurringChargesWhere = { isActive: true };
    if (creditCardId) {
      recurringChargesWhere.creditCardId = creditCardId;
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

    // Calcular totales
    const installmentsTotal = installments.reduce(
      (sum, inst) => sum + parseFloat(inst.amount),
      0
    );
    const recurringChargesTotal = recurringCharges.reduce(
      (sum, charge) => sum + parseFloat(charge.amount),
      0
    );

    res.json({
      projections: {
        month: targetMonth + 1,
        year: targetYear,
        installments,
        recurringCharges,
        totals: {
          installments: installmentsTotal.toFixed(2),
          recurringCharges: recurringChargesTotal.toFixed(2),
          total: (installmentsTotal + recurringChargesTotal).toFixed(2),
        },
      },
    });
  } catch (err) {
    console.error("Error en getProjections:", err);
    res.status(500).json({ error: "Error al obtener proyecciones" });
  }
}

// Crear pago de resumen de tarjeta
export async function createCreditCardPayment(req, res) {
  try {
    const {
      amount,
      paymentDate,
      currency,
      notes,
      creditCardId,
      paymentMethodId,
      installmentIds,
    } = req.body;
    const userId = req.user.userId;

    if (!amount || !creditCardId) {
      return res.status(400).json({
        error: "Monto y tarjeta son requeridos",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "El monto debe ser mayor a 0" });
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

    // Buscar o crear categoría "Tarjetas de credito"
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

    // Crear la transacción de egreso que afecta el balance
    const transaction = await models.Transaction.create({
      amount,
      date: paymentDate || new Date().toISOString().split("T")[0],
      description: `Pago ${creditCard.name} (${creditCard.bank})`,
      type: "Egreso",
      currency: currency || "ARS",
      categoryId: category.id,
      paymentMethodId: paymentMethodId || null,
      userId,
    });

    // Crear el registro de pago de tarjeta
    const payment = await models.CreditCardPayment.create({
      amount,
      paymentDate: paymentDate || new Date().toISOString().split("T")[0],
      currency: currency || "ARS",
      notes: notes || null,
      creditCardId,
      transactionId: transaction.id,
      userId,
    });

    // Marcar cuotas como pagadas si se proporcionaron
    if (installmentIds && installmentIds.length > 0) {
      await models.CreditCardInstallment.update(
        {
          isPaid: true,
          paidDate: paymentDate || new Date().toISOString().split("T")[0],
        },
        {
          where: {
            id: {
              [Op.in]: installmentIds,
            },
          },
        }
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

// Obtener pagos de tarjeta
export async function getCreditCardPayments(req, res) {
  try {
    const { creditCardId, fromDate, toDate } = req.query;

    const where = {};

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

// Obtener resumen de deuda por tarjeta
export async function getCreditCardSummary(req, res) {
  try {
    const { id } = req.params;

    const creditCard = await models.CreditCard.findOne({
      where: { id },
    });

    if (!creditCard) {
      return res
        .status(404)
        .json({ error: "Tarjeta de crédito no encontrada" });
    }

    // Obtener cuotas pendientes
    const pendingInstallments = await models.CreditCardInstallment.findAll({
      where: { isPaid: false },
      include: [
        {
          model: models.CreditCardExpense,
          as: "expense",
          where: { creditCardId: id },
          attributes: ["id", "description", "totalAmount", "currency"],
        },
      ],
      order: [["dueDate", "ASC"]],
    });

    // Obtener débitos recurrentes activos
    const activeRecurringCharges =
      await models.CreditCardRecurringCharge.findAll({
        where: {
          creditCardId: id,
          isActive: true,
        },
      });

    // Calcular totales
    const totalPendingDebt = pendingInstallments.reduce(
      (sum, inst) => sum + parseFloat(inst.amount),
      0
    );

    const monthlyRecurringTotal = activeRecurringCharges.reduce(
      (sum, charge) => sum + parseFloat(charge.amount),
      0
    );

    // Próximo vencimiento
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

// Eliminar pago de tarjeta
export async function deleteCreditCardPayment(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    console.log(
      `[DELETE PAYMENT] Intentando eliminar pago ID: ${id}, Usuario: ${userId}`
    );

    const payment = await models.CreditCardPayment.findOne({
      where: { id, userId },
    });

    if (!payment) {
      console.log(`[DELETE PAYMENT] Pago no encontrado: ID ${id}`);
      return res.status(404).json({ error: "Pago no encontrado" });
    }

    const transactionId = payment.transactionId;
    console.log(
      `[DELETE PAYMENT] Pago encontrado. Transaction ID: ${transactionId}`
    );

    // Primero eliminar el pago
    await payment.destroy();
    console.log(`[DELETE PAYMENT] Pago eliminado de la base de datos`);

    // Luego eliminar la transacción asociada si existe
    if (transactionId) {
      await models.Transaction.destroy({
        where: { id: transactionId },
      });
      console.log(`[DELETE PAYMENT] Transacción ${transactionId} eliminada`);
    }

    console.log(`[DELETE PAYMENT] Operación completada exitosamente`);
    res.json({ message: "Pago eliminado exitosamente" });
  } catch (err) {
    console.error("Error en deleteCreditCardPayment:", err);
    res.status(500).json({ error: "Error al eliminar pago" });
  }
}
