import { models } from "../models/index.js";
import { Op } from "sequelize";

function getTodayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function createLoan(req, res) {
  try {
    const {
      entity,
      totalAmount,
      currency,
      interestRate,
      loanDate,
      dueDate,
      installments,
      installmentAmount,
      description,
    } = req.body;
    const userId = req.user.userId;

    if (!entity || !totalAmount) {
      return res
        .status(400)
        .json({ error: "Entidad y monto total son requeridos" });
    }

    const loan = await models.Loan.create({
      entity,
      totalAmount,
      pendingAmount: totalAmount, // Inicialmente, todo está pendiente
      currency: currency || "ARS",
      interestRate,
      loanDate: loanDate || getTodayLocalDate(),
      dueDate,
      installments,
      installmentAmount,
      status: "Activo",
      description,
      userId,
    });

    res.status(201).json({
      message: "Préstamo creado exitosamente",
      loan,
    });
  } catch (err) {
    console.error("Error en createLoan:", err);
    res.status(500).json({ error: "Error al crear préstamo" });
  }
}

export async function getLoans(req, res) {
  try {
    const { status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const loans = await models.Loan.findAll({
      where,
      order: [["loanDate", "DESC"]],
      include: [
        {
          model: models.LoanPayment,
          as: "payments",
          required: false,
        },
      ],
    });

    res.json({ loans });
  } catch (err) {
    console.error("Error en getLoans:", err);
    res.status(500).json({ error: "Error al obtener préstamos" });
  }
}

export async function getLoanById(req, res) {
  try {
    const { id } = req.params;

    const loan = await models.Loan.findOne({
      where: { id },
      include: [
        {
          model: models.LoanPayment,
          as: "payments",
          order: [["paymentDate", "DESC"]],
        },
      ],
    });

    if (!loan) {
      return res.status(404).json({ error: "Préstamo no encontrado" });
    }

    res.json({ loan });
  } catch (err) {
    console.error("Error en getLoanById:", err);
    res.status(500).json({ error: "Error al obtener préstamo" });
  }
}

export async function updateLoan(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const {
      entity,
      totalAmount,
      currency,
      interestRate,
      loanDate,
      dueDate,
      installments,
      installmentAmount,
      description,
    } = req.body;

    const loan = await models.Loan.findOne({
      where: { id: loanId },
    });

    if (!loan) {
      return res.status(404).json({ error: "Préstamo no encontrado" });
    }

    // Verificar si tiene pagos
    const paymentsCount = await models.LoanPayment.count({
      where: { loanId: id },
    });

    if (paymentsCount > 0) {
      return res.status(400).json({
        error: "No se puede editar un préstamo que ya tiene pagos registrados",
      });
    }

    // Actualizar campos
    if (entity) loan.entity = entity;
    if (totalAmount) {
      loan.totalAmount = totalAmount;
      loan.pendingAmount = totalAmount;
    }
    if (currency) loan.currency = currency;
    if (interestRate !== undefined) loan.interestRate = interestRate;
    if (loanDate) loan.loanDate = loanDate;
    if (dueDate !== undefined) loan.dueDate = dueDate;
    if (installments !== undefined) loan.installments = installments;
    if (installmentAmount !== undefined)
      loan.installmentAmount = installmentAmount;
    if (description !== undefined) loan.description = description;

    await loan.save();

    res.json({
      message: "Préstamo actualizado exitosamente",
      loan,
    });
  } catch (err) {
    console.error("Error en updateLoan:", err);
    res.status(500).json({ error: "Error al actualizar préstamo" });
  }
}

export async function deleteLoan(req, res) {
  try {
    const { id } = req.params;

    const loan = await models.Loan.findOne({
      where: { id },
    });

    if (!loan) {
      return res.status(404).json({ error: "Préstamo no encontrado" });
    }

    // Verificar si tiene pagos
    const paymentsCount = await models.LoanPayment.count({
      where: { loanId: id },
    });

    if (paymentsCount > 0) {
      return res.status(400).json({
        error: "No se puede eliminar un préstamo que tiene pagos registrados",
      });
    }

    await loan.destroy();

    res.json({ message: "Préstamo eliminado exitosamente" });
  } catch (err) {
    console.error("Error en deleteLoan:", err);
    res.status(500).json({ error: "Error al eliminar préstamo" });
  }
}

export async function registerPayment(req, res) {
  const t = await models.Loan.sequelize.transaction();

  try {
    const { id } = req.params;
    const { amount, paymentDate, notes } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "El monto del pago debe ser mayor a 0" });
    }

    const loan = await models.Loan.findOne({
      where: { id },
      transaction: t,
    });

    if (!loan) {
      await t.rollback();
      return res.status(404).json({ error: "Préstamo no encontrado" });
    }

    if (parseFloat(amount) > parseFloat(loan.pendingAmount)) {
      await t.rollback();
      return res.status(400).json({
        error: "El monto del pago excede el monto pendiente",
      });
    }

    // Buscar categoría "Préstamos" (debe existir)
    const loanCategory = await models.Category.findOne({
      where: {
        userId,
        name: { [Op.like]: "%Préstamo%" },
        type: "Egreso",
      },
      transaction: t,
    });

    let categoryId = loanCategory?.id;

    // Si no existe, crear categoría "Préstamos"
    if (!categoryId) {
      const newCategory = await models.Category.create(
        {
          name: "Préstamos",
          type: "Egreso",
          userId,
        },
        { transaction: t }
      );
      categoryId = newCategory.id;
    }

    // Crear transacción asociada
    const transaction = await models.Transaction.create(
      {
        amount,
        date: paymentDate || getTodayLocalDate(),
        description: `Pago de préstamo - ${loan.entity}${
          notes ? ` - ${notes}` : ""
        }`,
        type: "Egreso",
        currency: loan.currency,
        categoryId,
        userId,
      },
      { transaction: t }
    );

    // Registrar pago
    const payment = await models.LoanPayment.create(
      {
        loanId: id,
        amount,
        paymentDate: paymentDate || getTodayLocalDate(),
        transactionId: transaction.id,
        notes,
        userId,
      },
      { transaction: t }
    );

    // Actualizar monto pendiente del préstamo
    const newPendingAmount =
      parseFloat(loan.pendingAmount) - parseFloat(amount);
    loan.pendingAmount = newPendingAmount;

    // Actualizar estado si está totalmente pagado
    if (newPendingAmount <= 0) {
      loan.status = "Pagado";
    }

    await loan.save({ transaction: t });

    await t.commit();

    res.json({
      message: "Pago registrado exitosamente",
      payment,
      loan: {
        id: loan.id,
        pendingAmount: loan.pendingAmount,
        status: loan.status,
      },
    });
  } catch (err) {
    await t.rollback();
    console.error("Error en registerPayment:", err);
    res.status(500).json({ error: "Error al registrar pago" });
  }
}
