import { models } from "../models/index.js";
import { Op } from "sequelize";

// Función helper para obtener la fecha actual en formato YYYY-MM-DD local
function getTodayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function createTransaction(req, res) {
  try {
    const { amount, date, description, type, categoryId, paymentMethodId } =
      req.body;
    const userId = req.user.userId;

    if (!amount || !type || !categoryId) {
      return res
        .status(400)
        .json({ error: "Amount, type y categoryId son requeridos" });
    }

    if (!["Ingreso", "Egreso"].includes(type)) {
      return res
        .status(400)
        .json({ error: 'Type debe ser "Ingreso" o "Egreso"' });
    }

    // Verificar que la categoría existe
    const category = await models.Category.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    // Verificar que el tipo coincida con el de la categoría
    if (category.type !== type) {
      return res.status(400).json({
        error: `La categoría es de tipo "${category.type}", no "${type}"`,
      });
    }

    // Verificar que el medio de pago existe (si se proporciona)
    if (paymentMethodId) {
      const paymentMethod = await models.PaymentMethod.findOne({
        where: { id: paymentMethodId },
      });

      if (!paymentMethod) {
        return res.status(404).json({ error: "Medio de pago no encontrado" });
      }
    }

    const transaction = await models.Transaction.create({
      amount,
      date: date || getTodayLocalDate(),
      description,
      type,
      categoryId,
      paymentMethodId: paymentMethodId || null,
      userId,
    });

    res.status(201).json({
      message: "Transacción creada exitosamente",
      transaction,
    });
  } catch (err) {
    console.error("Error en createTransaction:", err);
    res.status(500).json({ error: "Error al crear transacción" });
  }
}

export async function getTransactions(req, res) {
  try {
    const { type, categoryId, fromDate, toDate } = req.query;

    const where = {};

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date[Op.gte] = fromDate;
      if (toDate) where.date[Op.lte] = toDate;
    }

    const transactions = await models.Transaction.findAll({
      where,
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
      order: [["date", "DESC"]],
    });

    res.json({ transactions });
  } catch (err) {
    console.error("Error en getTransactions:", err);
    res.status(500).json({ error: "Error al obtener transacciones" });
  }
}

export async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const { amount, date, description, type, categoryId, paymentMethodId } =
      req.body;
    const userId = req.user.userId;

    const transaction = await models.Transaction.findOne({
      where: { id },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transacción no encontrada" });
    }

    if (type && !["Ingreso", "Egreso"].includes(type)) {
      return res
        .status(400)
        .json({ error: 'Type debe ser "Ingreso" o "Egreso"' });
    }

    // Si cambia categoryId, verificar que existe
    if (categoryId && categoryId !== transaction.categoryId) {
      const category = await models.Category.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }

      // Verificar que el tipo coincida
      const newType = type || transaction.type;
      if (category.type !== newType) {
        return res.status(400).json({
          error: `La categoría es de tipo "${category.type}", no "${newType}"`,
        });
      }
    }

    // Verificar que el medio de pago existe (si se proporciona)
    if (paymentMethodId !== undefined && paymentMethodId !== null) {
      const paymentMethod = await models.PaymentMethod.findOne({
        where: { id: paymentMethodId },
      });

      if (!paymentMethod) {
        return res.status(404).json({ error: "Medio de pago no encontrado" });
      }
    }

    if (amount !== undefined) transaction.amount = amount;
    if (date) transaction.date = date;
    if (description !== undefined) transaction.description = description;
    if (type) transaction.type = type;
    if (categoryId) transaction.categoryId = categoryId;
    if (paymentMethodId !== undefined)
      transaction.paymentMethodId = paymentMethodId;

    await transaction.save();

    res.json({
      message: "Transacción actualizada exitosamente",
      transaction,
    });
  } catch (err) {
    console.error("Error en updateTransaction:", err);
    res.status(500).json({ error: "Error al actualizar transacción" });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;

    const transaction = await models.Transaction.findOne({
      where: { id },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transacción no encontrada" });
    }

    await transaction.destroy();

    res.json({ message: "Transacción eliminada exitosamente" });
  } catch (err) {
    console.error("Error en deleteTransaction:", err);
    res.status(500).json({ error: "Error al eliminar transacción" });
  }
}
