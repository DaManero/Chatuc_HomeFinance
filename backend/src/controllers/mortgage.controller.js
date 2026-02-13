import { models } from "../models/index.js";
import { Op } from "sequelize";

function getTodayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// GET /mortgage - Obtener el préstamo hipotecario con resumen
export async function getMortgage(req, res) {
  try {
    const userId = req.user.userId;

    const mortgage = await models.MortgageLoan.findOne({
      where: { userId },
    });

    if (!mortgage) {
      return res.json({ mortgage: null });
    }

    // Calcular estadísticas
    const installments = await models.MortgageInstallment.findAll({
      where: { mortgageLoanId: mortgage.id },
      order: [["installmentNumber", "ASC"]],
    });

    const paidInstallments = installments.filter((i) => i.isPaid);
    const pendingInstallments = installments.filter((i) => !i.isPaid);
    const nextInstallment = pendingInstallments[0] || null;

    const totalPaidArs = paidInstallments.reduce(
      (sum, i) => sum + parseFloat(i.amountPaid || 0),
      0,
    );
    const totalPaidUsd = paidInstallments.reduce(
      (sum, i) => sum + parseFloat(i.amountUsd || 0),
      0,
    );
    const totalPaidUva = paidInstallments.reduce(
      (sum, i) => sum + parseFloat(i.totalUva || 0),
      0,
    );
    const remainingUva = parseFloat(mortgage.totalUva) - totalPaidUva;

    res.json({
      mortgage,
      summary: {
        totalUva: parseFloat(mortgage.totalUva),
        paidUva: totalPaidUva,
        remainingUva,
        paidInstallments: paidInstallments.length,
        pendingInstallments: pendingInstallments.length,
        totalPaidArs,
        totalPaidUsd,
        progressPercent:
          (paidInstallments.length / mortgage.totalInstallments) * 100,
      },
      nextInstallment,
    });
  } catch (err) {
    console.error("Error en getMortgage:", err);
    res.status(500).json({ error: "Error al obtener préstamo hipotecario" });
  }
}

// GET /mortgage/installments - Obtener todas las cuotas
export async function getInstallments(req, res) {
  try {
    const userId = req.user.userId;

    const mortgage = await models.MortgageLoan.findOne({
      where: { userId },
    });

    if (!mortgage) {
      return res.status(404).json({ error: "No hay préstamo hipotecario" });
    }

    const installments = await models.MortgageInstallment.findAll({
      where: { mortgageLoanId: mortgage.id },
      order: [["installmentNumber", "ASC"]],
    });

    res.json({ installments });
  } catch (err) {
    console.error("Error en getInstallments:", err);
    res.status(500).json({ error: "Error al obtener cuotas" });
  }
}

// POST /mortgage/pay - Pagar la próxima cuota
export async function payInstallment(req, res) {
  const t = await models.MortgageLoan.sequelize.transaction();
  try {
    const userId = req.user.userId;
    const { installmentId, uvaRate, dollarRate } = req.body;

    if (!uvaRate || uvaRate <= 0) {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "La cotización del UVA es requerida" });
    }

    const installment = await models.MortgageInstallment.findOne({
      where: { id: installmentId, userId },
      transaction: t,
    });

    if (!installment) {
      await t.rollback();
      return res.status(404).json({ error: "Cuota no encontrada" });
    }

    if (installment.isPaid) {
      await t.rollback();
      return res.status(400).json({ error: "Esta cuota ya fue pagada" });
    }

    const totalUva = parseFloat(installment.totalUva);
    const amountPaid = Math.round(totalUva * parseFloat(uvaRate) * 100) / 100;
    const amountUsd =
      dollarRate && dollarRate > 0
        ? Math.round((amountPaid / parseFloat(dollarRate)) * 100) / 100
        : null;

    // Buscar o crear categoría "Hipotecario"
    let category = await models.Category.findOne({
      where: { userId, name: "Hipotecario", type: "Egreso" },
      transaction: t,
    });

    if (!category) {
      category = await models.Category.create(
        { name: "Hipotecario", type: "Egreso", userId },
        { transaction: t },
      );
    }

    // Crear transacción
    const transaction = await models.Transaction.create(
      {
        amount: amountPaid,
        date: getTodayLocalDate(),
        description: `Cuota ${installment.installmentNumber}/360 - Hipotecario (${totalUva} UVAs × $${uvaRate})`,
        type: "Egreso",
        currency: "ARS",
        categoryId: category.id,
        userId,
      },
      { transaction: t },
    );

    // Actualizar cuota
    installment.isPaid = true;
    installment.paidDate = getTodayLocalDate();
    installment.uvaRate = uvaRate;
    installment.amountPaid = amountPaid;
    installment.dollarRate = dollarRate || null;
    installment.amountUsd = amountUsd;
    installment.transactionId = transaction.id;
    await installment.save({ transaction: t });

    // Actualizar préstamo
    const mortgage = await models.MortgageLoan.findOne({
      where: { id: installment.mortgageLoanId },
      transaction: t,
    });

    mortgage.paidUva = parseFloat(mortgage.paidUva) + totalUva;
    mortgage.paidInstallments = mortgage.paidInstallments + 1;

    if (mortgage.paidInstallments >= mortgage.totalInstallments) {
      mortgage.status = "Pagado";
    }

    await mortgage.save({ transaction: t });

    await t.commit();

    res.json({
      message: "Cuota pagada exitosamente",
      installment,
      amountPaid,
      amountUsd,
    });
  } catch (err) {
    await t.rollback();
    console.error("Error en payInstallment:", err);
    res.status(500).json({ error: "Error al pagar cuota" });
  }
}

// POST /mortgage/setup - Configuración inicial del préstamo + generación de cuotas
export async function setupMortgage(req, res) {
  const t = await models.MortgageLoan.sequelize.transaction();
  try {
    const userId = req.user.userId;
    const {
      name,
      totalUva,
      annualRate,
      totalInstallments,
      startDate,
      firstInstallment,
    } = req.body;

    // Verificar que no exista ya un préstamo hipotecario
    const existing = await models.MortgageLoan.findOne({
      where: { userId },
      transaction: t,
    });

    if (existing) {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "Ya existe un préstamo hipotecario configurado" });
    }

    if (!totalUva || !annualRate || !totalInstallments || !startDate) {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "Faltan datos requeridos para la configuración" });
    }

    const mortgage = await models.MortgageLoan.create(
      {
        name: name || "Préstamo Hipotecario UVA",
        totalUva,
        annualRate,
        totalInstallments,
        startDate,
        userId,
      },
      { transaction: t },
    );

    // Generar las cuotas
    const monthlyRate = parseFloat(annualRate) / 100 / 12;
    const n = parseInt(totalInstallments);
    const installmentsToCreate = [];

    // Cuota 1 (especial - datos manuales)
    if (firstInstallment) {
      const dueDate = startDate;
      installmentsToCreate.push({
        mortgageLoanId: mortgage.id,
        installmentNumber: 1,
        capitalUva: firstInstallment.capitalUva,
        interestUva: firstInstallment.interestUva,
        totalUva: firstInstallment.totalUva,
        dueDate,
        isPaid: firstInstallment.isPaid || false,
        paidDate: firstInstallment.paidDate || null,
        uvaRate: firstInstallment.uvaRate || null,
        amountPaid: firstInstallment.amountPaid || null,
        dollarRate: firstInstallment.dollarRate || null,
        amountUsd: firstInstallment.amountUsd || null,
        userId,
      });
    }

    // Cuotas 2 a N (sistema francés)
    // Saldo después de cuota 1
    const capitalCuota1 = firstInstallment
      ? parseFloat(firstInstallment.capitalUva)
      : 0;
    let balance = parseFloat(totalUva) - capitalCuota1;
    const remainingPeriods = n - 1;

    // Calcular cuota fija para cuotas 2-N
    const pmt =
      (balance * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -remainingPeriods));

    for (let i = 2; i <= n; i++) {
      const interestUva = Math.round(balance * monthlyRate * 100) / 100;
      const capitalUva = Math.round((pmt - interestUva) * 100) / 100;
      const totalUvaInstallment =
        Math.round((capitalUva + interestUva) * 100) / 100;

      // Calcular fecha de vencimiento (día 10 de cada mes)
      const startDateObj = new Date(startDate + "T00:00:00");
      const dueMonth = startDateObj.getMonth() + (i - 1);
      const dueYear = startDateObj.getFullYear() + Math.floor(dueMonth / 12);
      const dueMonthNormalized = dueMonth % 12;
      const dueDateStr = `${dueYear}-${String(dueMonthNormalized + 1).padStart(2, "0")}-10`;

      installmentsToCreate.push({
        mortgageLoanId: mortgage.id,
        installmentNumber: i,
        capitalUva,
        interestUva,
        totalUva: totalUvaInstallment,
        dueDate: dueDateStr,
        isPaid: false,
        userId,
      });

      balance -= capitalUva;
    }

    await models.MortgageInstallment.bulkCreate(installmentsToCreate, {
      transaction: t,
    });

    // Si la cuota 1 estaba pagada, actualizar el préstamo
    if (firstInstallment && firstInstallment.isPaid) {
      mortgage.paidUva = parseFloat(firstInstallment.totalUva);
      mortgage.paidInstallments = 1;
      await mortgage.save({ transaction: t });
    }

    await t.commit();

    res.status(201).json({
      message: "Préstamo hipotecario configurado exitosamente",
      mortgage,
      installmentsGenerated: installmentsToCreate.length,
    });
  } catch (err) {
    await t.rollback();
    console.error("Error en setupMortgage:", err);
    res.status(500).json({ error: "Error al configurar préstamo hipotecario" });
  }
}
