import { models } from "../models/index.js";

export async function createPaymentMethod(req, res) {
  try {
    const { name, type } = req.body;
    const userId = req.user.userId;

    if (!name || !type) {
      return res.status(400).json({ error: "Nombre y tipo son requeridos" });
    }

    if (
      ![
        "Efectivo",
        "Tarjeta",
        "Transferencia",
        "Billetera Virtual",
        "Otro",
      ].includes(type)
    ) {
      return res.status(400).json({
        error:
          'Tipo debe ser "Efectivo", "Tarjeta", "Transferencia", "Billetera Virtual" u "Otro"',
      });
    }

    const paymentMethod = await models.PaymentMethod.create({
      name,
      type,
      userId,
    });

    res.status(201).json({
      message: "Medio de pago creado exitosamente",
      paymentMethod,
    });
  } catch (err) {
    console.error("Error en createPaymentMethod:", err);
    res.status(500).json({ error: "Error al crear medio de pago" });
  }
}

export async function getPaymentMethods(req, res) {
  try {
    const { type } = req.query;

    const where = {};
    if (type) {
      where.type = type;
    }

    const paymentMethods = await models.PaymentMethod.findAll({
      where,
      order: [["name", "ASC"]],
    });

    res.json({ paymentMethods });
  } catch (err) {
    console.error("Error en getPaymentMethods:", err);
    res.status(500).json({ error: "Error al obtener medios de pago" });
  }
}

export async function updatePaymentMethod(req, res) {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    const paymentMethod = await models.PaymentMethod.findOne({
      where: { id },
    });

    if (!paymentMethod) {
      return res.status(404).json({ error: "Medio de pago no encontrado" });
    }

    if (
      type &&
      ![
        "Efectivo",
        "Tarjeta",
        "Transferencia",
        "Billetera Virtual",
        "Otro",
      ].includes(type)
    ) {
      return res.status(400).json({
        error:
          'Tipo debe ser "Efectivo", "Tarjeta", "Transferencia", "Billetera Virtual" u "Otro"',
      });
    }

    if (name) paymentMethod.name = name;
    if (type) paymentMethod.type = type;

    await paymentMethod.save();

    res.json({
      message: "Medio de pago actualizado exitosamente",
      paymentMethod,
    });
  } catch (err) {
    console.error("Error en updatePaymentMethod:", err);
    res.status(500).json({ error: "Error al actualizar medio de pago" });
  }
}

export async function deletePaymentMethod(req, res) {
  try {
    const { id } = req.params;

    const paymentMethod = await models.PaymentMethod.findOne({
      where: { id },
    });

    if (!paymentMethod) {
      return res.status(404).json({ error: "Medio de pago no encontrado" });
    }

    await paymentMethod.destroy();

    res.json({ message: "Medio de pago eliminado exitosamente" });
  } catch (err) {
    console.error("Error en deletePaymentMethod:", err);
    res.status(500).json({ error: "Error al eliminar medio de pago" });
  }
}
