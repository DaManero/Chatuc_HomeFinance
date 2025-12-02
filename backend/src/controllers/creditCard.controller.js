import { models } from "../models/index.js";

export async function createCreditCard(req, res) {
  try {
    const {
      name,
      bank,
      brand,
      lastFourDigits,
      expirationMonth,
      expirationYear,
      dueDay,
    } = req.body;
    const userId = req.user.userId;

    if (
      !name ||
      !bank ||
      !brand ||
      !lastFourDigits ||
      !expirationMonth ||
      !expirationYear ||
      !dueDay
    ) {
      return res.status(400).json({
        error:
          "Nombre, banco, últimos 4 dígitos, mes/año de vencimiento y día de cierre son requeridos",
      });
    }

    if (lastFourDigits.length !== 4 || !/^\d{4}$/.test(lastFourDigits)) {
      return res.status(400).json({
        error: "Los últimos 4 dígitos deben ser exactamente 4 números",
      });
    }

    if (expirationMonth < 1 || expirationMonth > 12) {
      return res.status(400).json({
        error: "El mes de vencimiento debe estar entre 1 y 12",
      });
    }

    if (expirationYear < 2024) {
      return res.status(400).json({
        error: "El año de vencimiento no puede ser anterior a 2024",
      });
    }

    if (dueDay < 1 || dueDay > 31) {
      return res.status(400).json({
        error: "El día de cierre debe estar entre 1 y 31",
      });
    }

    const creditCard = await models.CreditCard.create({
      name,
      bank,
      brand,
      lastFourDigits,
      expirationMonth,
      expirationYear,
      dueDay,
      userId,
    });

    res.status(201).json({
      message: "Tarjeta de crédito creada exitosamente",
      creditCard,
    });
  } catch (err) {
    console.error("Error en createCreditCard:", err);
    res.status(500).json({ error: "Error al crear tarjeta de crédito" });
  }
}

export async function getCreditCards(req, res) {
  try {
    const creditCards = await models.CreditCard.findAll({
      order: [["name", "ASC"]],
    });

    res.json({ creditCards });
  } catch (err) {
    console.error("Error en getCreditCards:", err);
    res.status(500).json({ error: "Error al obtener tarjetas de crédito" });
  }
}

export async function updateCreditCard(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      bank,
      lastFourDigits,
      expirationMonth,
      expirationYear,
      dueDay,
    } = req.body;

    const creditCard = await models.CreditCard.findOne({ where: { id } });

    if (!creditCard) {
      return res
        .status(404)
        .json({ error: "Tarjeta de crédito no encontrada" });
    }

    if (
      lastFourDigits &&
      (lastFourDigits.length !== 4 || !/^\d{4}$/.test(lastFourDigits))
    ) {
      return res.status(400).json({
        error: "Los últimos 4 dígitos deben ser exactamente 4 números",
      });
    }

    if (expirationMonth && (expirationMonth < 1 || expirationMonth > 12)) {
      return res.status(400).json({
        error: "El mes de vencimiento debe estar entre 1 y 12",
      });
    }

    if (expirationYear && expirationYear < 2024) {
      return res.status(400).json({
        error: "El año de vencimiento no puede ser anterior a 2024",
      });
    }

    if (dueDay && (dueDay < 1 || dueDay > 31)) {
      return res.status(400).json({
        error: "El día de cierre debe estar entre 1 y 31",
      });
    }

    if (name !== undefined) creditCard.name = name;
    if (bank !== undefined) creditCard.bank = bank;
    if (brand !== undefined) creditCard.brand = brand;
    if (lastFourDigits !== undefined)
      creditCard.lastFourDigits = lastFourDigits;
    if (expirationMonth !== undefined)
      creditCard.expirationMonth = expirationMonth;
    if (expirationYear !== undefined)
      creditCard.expirationYear = expirationYear;
    if (dueDay !== undefined) creditCard.dueDay = dueDay;

    await creditCard.save();

    res.json({
      message: "Tarjeta de crédito actualizada exitosamente",
      creditCard,
    });
  } catch (err) {
    console.error("Error en updateCreditCard:", err);
    res.status(500).json({ error: "Error al actualizar tarjeta de crédito" });
  }
}

export async function deleteCreditCard(req, res) {
  try {
    const { id } = req.params;

    const creditCard = await models.CreditCard.findOne({ where: { id } });

    if (!creditCard) {
      return res
        .status(404)
        .json({ error: "Tarjeta de crédito no encontrada" });
    }

    // Verificar si tiene gastos asociados
    const expensesCount = await models.CreditCardExpense.count({
      where: { creditCardId: id },
    });

    if (expensesCount > 0) {
      return res.status(400).json({
        error: "No se puede eliminar la tarjeta porque tiene gastos asociados",
      });
    }

    await creditCard.destroy();

    res.json({ message: "Tarjeta de crédito eliminada exitosamente" });
  } catch (err) {
    console.error("Error en deleteCreditCard:", err);
    res.status(500).json({ error: "Error al eliminar tarjeta de crédito" });
  }
}
