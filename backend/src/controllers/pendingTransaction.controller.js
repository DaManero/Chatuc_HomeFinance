import PendingTransaction from "../models/pendingTransaction.model.js";
import { Transaction } from "../models/transaction.model.js";
import { Category } from "../models/category.model.js";
import messageParserService from "../services/messageParser.service.js";
import { sequelize } from "../config/db.js";

/**
 * Obtener todas las transacciones pendientes del usuario
 */
export async function getPendingTransactions(req, res) {
  try {
    const { status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    } else {
      // Por defecto solo mostrar pendientes
      where.status = "pending";
    }

    const pendingTransactions = await PendingTransaction.findAll({
      where,
      order: [["transactionDate", "DESC"]],
    });

    res.json(pendingTransactions);
  } catch (error) {
    console.error("Error al obtener transacciones pendientes:", error);
    res
      .status(500)
      .json({ error: "Error al obtener transacciones pendientes" });
  }
}

/**
 * Crear una transacción pendiente desde Telegram
 */
export async function createFromTelegram(req, res) {
  try {
    const { message, telegramChatId, telegramMessageId, userId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: "Mensaje y userId son requeridos" });
    }

    // Parsear el mensaje
    const parsed = messageParserService.parseMessage(message);

    // Crear la transacción pendiente
    const pendingTransaction = await PendingTransaction.create({
      rawMessage: message,
      amount: parsed.amount,
      currency: parsed.currency,
      type: parsed.type,
      suggestedCategory: parsed.suggestedCategory,
      description: parsed.description,
      transactionDate: new Date(),
      status: "pending",
      userId,
      telegramChatId,
      telegramMessageId,
    });

    res.status(201).json({
      success: true,
      pendingTransaction,
      parsed,
    });
  } catch (error) {
    console.error("Error al crear transacción pendiente:", error);
    res.status(500).json({ error: "Error al crear transacción pendiente" });
  }
}

/**
 * Procesar una transacción pendiente y crear la transacción real
 */
export async function processPendingTransaction(req, res) {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { userId } = req.user;
    const {
      amount,
      currency,
      type,
      categoryId,
      categoryName,
      description,
      date,
    } = req.body;

    // Validaciones
    if (!amount || !type) {
      await t.rollback();
      return res.status(400).json({ error: "Monto y tipo son requeridos" });
    }

    // Buscar la transacción pendiente
    const pending = await PendingTransaction.findOne({
      where: { id, status: "pending" },
      transaction: t,
    });

    if (!pending) {
      await t.rollback();
      return res
        .status(404)
        .json({ error: "Transacción pendiente no encontrada" });
    }

    // Buscar o crear categoría
    let category;
    if (categoryId) {
      category = await Category.findOne({
        where: { id: categoryId },
        transaction: t,
      });
    } else if (categoryName) {
      [category] = await Category.findOrCreate({
        where: { name: categoryName, type },
        defaults: { name: categoryName, type, userId },
        transaction: t,
      });
    }

    if (!category) {
      await t.rollback();
      return res.status(400).json({ error: "Categoría no válida" });
    }

    // Crear la transacción real
    const transaction = await Transaction.create(
      {
        amount,
        currency,
        type,
        categoryId: category.id,
        description: description || pending.description,
        date: date || pending.transactionDate,
        userId,
      },
      { transaction: t }
    );

    // Actualizar la transacción pendiente
    await pending.update(
      {
        status: "processed",
        processedTransactionId: transaction.id,
      },
      { transaction: t }
    );

    await t.commit();

    res.json({
      success: true,
      transaction,
      pendingTransaction: pending,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al procesar transacción pendiente:", error);
    res.status(500).json({ error: "Error al procesar transacción pendiente" });
  }
}

/**
 * Descartar una transacción pendiente
 */
export async function discardPendingTransaction(req, res) {
  try {
    const { id } = req.params;

    const pending = await PendingTransaction.findOne({
      where: { id, status: "pending" },
    });

    if (!pending) {
      return res
        .status(404)
        .json({ error: "Transacción pendiente no encontrada" });
    }

    await pending.update({ status: "discarded" });

    res.json({
      success: true,
      message: "Transacción descartada",
      pendingTransaction: pending,
    });
  } catch (error) {
    console.error("Error al descartar transacción pendiente:", error);
    res.status(500).json({ error: "Error al descartar transacción pendiente" });
  }
}

/**
 * Obtener estadísticas de transacciones pendientes
 */
export async function getPendingStats(req, res) {
  try {
    const stats = await PendingTransaction.findAll({
      where: {},
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    const result = {
      pending: 0,
      processed: 0,
      discarded: 0,
    };

    stats.forEach((stat) => {
      result[stat.status] = parseInt(stat.dataValues.count);
    });

    res.json(result);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
}
