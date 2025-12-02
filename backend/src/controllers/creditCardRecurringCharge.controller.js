import { models } from "../models/index.js";

export async function createRecurringCharge(req, res) {
  try {
    const {
      description,
      amount,
      chargeDay,
      currency,
      creditCardId,
      categoryId,
    } = req.body;
    const userId = req.user.userId;

    if (!description || !amount || !chargeDay || !creditCardId) {
      return res.status(400).json({
        error: "Descripción, monto, día de cargo y tarjeta son requeridos",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "El monto debe ser mayor a 0" });
    }

    if (chargeDay < 1 || chargeDay > 31) {
      return res.status(400).json({
        error: "El día de cargo debe estar entre 1 y 31",
      });
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

    // Verificar categoría si se proporciona
    if (categoryId) {
      const category = await models.Category.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }
    }

    const recurringCharge = await models.CreditCardRecurringCharge.create({
      description,
      amount,
      chargeDay,
      currency: currency || "ARS",
      isActive: true,
      creditCardId,
      categoryId: categoryId || null,
      userId,
    });

    res.status(201).json({
      message: "Débito automático creado exitosamente",
      recurringCharge,
    });
  } catch (err) {
    console.error("Error en createRecurringCharge:", err);
    res.status(500).json({ error: "Error al crear débito automático" });
  }
}

export async function getRecurringCharges(req, res) {
  try {
    const { creditCardId, isActive } = req.query;

    const where = {};

    if (creditCardId) {
      where.creditCardId = creditCardId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const recurringCharges = await models.CreditCardRecurringCharge.findAll({
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
      ],
      order: [["description", "ASC"]],
    });

    res.json({ recurringCharges });
  } catch (err) {
    console.error("Error en getRecurringCharges:", err);
    res.status(500).json({ error: "Error al obtener débitos automáticos" });
  }
}

export async function updateRecurringCharge(req, res) {
  try {
    const { id } = req.params;
    const { description, amount, chargeDay, currency, isActive, categoryId } =
      req.body;

    const recurringCharge = await models.CreditCardRecurringCharge.findOne({
      where: { id },
    });

    if (!recurringCharge) {
      return res.status(404).json({ error: "Débito automático no encontrado" });
    }

    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ error: "El monto debe ser mayor a 0" });
    }

    if (chargeDay !== undefined && (chargeDay < 1 || chargeDay > 31)) {
      return res.status(400).json({
        error: "El día de cargo debe estar entre 1 y 31",
      });
    }

    if (categoryId !== undefined && categoryId !== null) {
      const category = await models.Category.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }
    }

    if (description !== undefined) recurringCharge.description = description;
    if (amount !== undefined) recurringCharge.amount = amount;
    if (chargeDay !== undefined) recurringCharge.chargeDay = chargeDay;
    if (currency !== undefined) recurringCharge.currency = currency;
    if (isActive !== undefined) recurringCharge.isActive = isActive;
    if (categoryId !== undefined) recurringCharge.categoryId = categoryId;

    await recurringCharge.save();

    res.json({
      message: "Débito automático actualizado exitosamente",
      recurringCharge,
    });
  } catch (err) {
    console.error("Error en updateRecurringCharge:", err);
    res.status(500).json({ error: "Error al actualizar débito automático" });
  }
}

export async function deleteRecurringCharge(req, res) {
  try {
    const { id } = req.params;

    const recurringCharge = await models.CreditCardRecurringCharge.findOne({
      where: { id },
    });

    if (!recurringCharge) {
      return res.status(404).json({ error: "Débito automático no encontrado" });
    }

    await recurringCharge.destroy();

    res.json({ message: "Débito automático eliminado exitosamente" });
  } catch (err) {
    console.error("Error en deleteRecurringCharge:", err);
    res.status(500).json({ error: "Error al eliminar débito automático" });
  }
}
