import { models } from "../models/index.js";
import { Op } from "sequelize";

function getTodayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function ensureMortgageProjectionCategory({ userId, transaction }) {
  // Categoría principal para agrupar gastos del hogar en proyecciones.
  let parentCategory = await models.Category.findOne({
    where: {
      userId,
      name: "Gastos del Departamento",
      type: "Egreso",
      parentCategoryId: null,
    },
    transaction,
  });

  if (!parentCategory) {
    parentCategory = await models.Category.create(
      {
        userId,
        name: "Gastos del Departamento",
        type: "Egreso",
        parentCategoryId: null,
        isRecurring: true,
      },
      { transaction },
    );
  } else if (!parentCategory.isRecurring) {
    parentCategory.isRecurring = true;
    await parentCategory.save({ transaction });
  }

  // Subcategoría específica de hipoteca donde se imputan los pagos.
  let mortgageCategory = await models.Category.findOne({
    where: {
      userId,
      name: "Hipoteca",
      type: "Egreso",
      parentCategoryId: parentCategory.id,
    },
    transaction,
  });

  if (!mortgageCategory) {
    // Compatibilidad con datos viejos donde "Hipoteca" pudo existir sin padre.
    mortgageCategory = await models.Category.findOne({
      where: {
        userId,
        name: "Hipoteca",
        type: "Egreso",
      },
      transaction,
    });

    if (mortgageCategory) {
      mortgageCategory.parentCategoryId = parentCategory.id;
      mortgageCategory.isRecurring = true;
      await mortgageCategory.save({ transaction });
    }
  }

  if (!mortgageCategory) {
    mortgageCategory = await models.Category.create(
      {
        userId,
        name: "Hipoteca",
        type: "Egreso",
        parentCategoryId: parentCategory.id,
        isRecurring: true,
      },
      { transaction },
    );
  } else if (!mortgageCategory.isRecurring) {
    mortgageCategory.isRecurring = true;
    await mortgageCategory.save({ transaction });
  }

  return mortgageCategory;
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

    const category = await ensureMortgageProjectionCategory({
      userId,
      transaction: t,
    });

    // Crear transacción
    const transaction = await models.Transaction.create(
      {
        amount: amountPaid,
        date: getTodayLocalDate(),
        description: `Cuota ${installment.installmentNumber}/360 - Hipoteca (${totalUva} UVAs × $${uvaRate})`,
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

// GET /mortgage/income-ratio?months=12
// Devuelve, para cada uno de los últimos N meses con cuota pagada,
// el monto de la cuota (ARS / USD) y los ingresos por sueldo del mismo mes
// (sumando transacciones Ingreso cuyo nombre de categoría contenga
// "sueldo" o "salario"), usando para la conversión a USD el dollarRate
// registrado en la cuota de ese mes.
export async function getMortgageIncomeRatio(req, res) {
  try {
    const userId = req.user.userId;
    const monthsParam = parseInt(req.query.months, 10);
    const months = [6, 12, 24].includes(monthsParam) ? monthsParam : 12;

    const mortgage = await models.MortgageLoan.findOne({ where: { userId } });
    if (!mortgage) {
      return res.json({ data: [], months });
    }

    const paidInstallments = await models.MortgageInstallment.findAll({
      where: {
        mortgageLoanId: mortgage.id,
        isPaid: true,
        paidDate: { [Op.ne]: null },
      },
      order: [["paidDate", "ASC"]],
    });

    if (paidInstallments.length === 0) {
      return res.json({ data: [], months });
    }

    // Agrupar cuotas por YYYY-MM de paidDate. Si hubiera más de una en el mismo
    // mes, sumamos los importes y promediamos dollarRate ponderado por ARS.
    const byMonth = new Map();
    for (const inst of paidInstallments) {
      const key = String(inst.paidDate).slice(0, 7); // YYYY-MM
      const amountArs = parseFloat(inst.amountPaid || 0);
      const dollarRate = inst.dollarRate ? parseFloat(inst.dollarRate) : null;
      const amountUsd =
        inst.amountUsd != null
          ? parseFloat(inst.amountUsd)
          : dollarRate
            ? amountArs / dollarRate
            : null;

      const prev = byMonth.get(key) || {
        installmentArs: 0,
        installmentUsd: 0,
        dollarRateNum: 0,
        dollarRateDen: 0,
      };
      prev.installmentArs += amountArs;
      if (amountUsd != null) prev.installmentUsd += amountUsd;
      if (dollarRate) {
        prev.dollarRateNum += dollarRate * amountArs;
        prev.dollarRateDen += amountArs;
      }
      byMonth.set(key, prev);
    }

    // Tomar los últimos N meses con cuota pagada
    const sortedKeys = Array.from(byMonth.keys()).sort();
    const selectedKeys = sortedKeys.slice(-months);
    if (selectedKeys.length === 0) {
      return res.json({ data: [], months });
    }

    const rangeStart = `${selectedKeys[0]}-01`;
    const lastKey = selectedKeys[selectedKeys.length - 1];
    const [ly, lm] = lastKey.split("-").map(Number);
    const lastDay = new Date(ly, lm, 0).getDate();
    const rangeEnd = `${lastKey}-${String(lastDay).padStart(2, "0")}`;

    // Categorías de "Sueldo" / "Salario" del usuario
    const salaryCategories = await models.Category.findAll({
      where: {
        userId,
        type: "Ingreso",
        [Op.or]: [
          { name: { [Op.iLike]: "%sueldo%" } },
          { name: { [Op.iLike]: "%salario%" } },
        ],
      },
      attributes: ["id"],
    });
    const salaryCategoryIds = salaryCategories.map((c) => c.id);

    let salaryByMonth = new Map();
    if (salaryCategoryIds.length > 0) {
      const incomes = await models.Transaction.findAll({
        where: {
          userId,
          type: "Ingreso",
          categoryId: { [Op.in]: salaryCategoryIds },
          date: { [Op.between]: [rangeStart, rangeEnd] },
        },
        attributes: ["amount", "date", "currency"],
      });

      for (const tx of incomes) {
        const key = String(tx.date).slice(0, 7);
        const prev = salaryByMonth.get(key) || { ars: 0, usd: 0 };
        const amount = parseFloat(tx.amount);
        if (tx.currency === "USD") prev.usd += amount;
        else prev.ars += amount;
        salaryByMonth.set(key, prev);
      }
    }

    const monthLabel = (key) => {
      const [y, m] = key.split("-").map(Number);
      return new Date(y, m - 1, 1).toLocaleDateString("es-AR", {
        month: "short",
        year: "2-digit",
      });
    };

    const data = selectedKeys.map((key) => {
      const inst = byMonth.get(key);
      const dollarRate =
        inst.dollarRateDen > 0 ? inst.dollarRateNum / inst.dollarRateDen : null;

      const salary = salaryByMonth.get(key) || { ars: 0, usd: 0 };
      // Convertir todo a la misma moneda usando el dollarRate de la cuota del mes
      const incomeArs = salary.ars + (dollarRate ? salary.usd * dollarRate : 0);
      const incomeUsd = dollarRate
        ? salary.ars / dollarRate + salary.usd
        : salary.usd;

      const ratioArs =
        incomeArs > 0 ? (inst.installmentArs / incomeArs) * 100 : null;
      const ratioUsd =
        incomeUsd > 0 && inst.installmentUsd > 0
          ? (inst.installmentUsd / incomeUsd) * 100
          : null;

      return {
        month: key,
        label: monthLabel(key),
        installmentArs: Math.round(inst.installmentArs * 100) / 100,
        installmentUsd: Math.round(inst.installmentUsd * 100) / 100,
        incomeArs: Math.round(incomeArs * 100) / 100,
        incomeUsd: Math.round(incomeUsd * 100) / 100,
        dollarRate: dollarRate ? Math.round(dollarRate * 100) / 100 : null,
        ratioArs: ratioArs != null ? Math.round(ratioArs * 100) / 100 : null,
        ratioUsd: ratioUsd != null ? Math.round(ratioUsd * 100) / 100 : null,
      };
    });

    res.json({
      months,
      hasSalaryCategories: salaryCategoryIds.length > 0,
      data,
    });
  } catch (err) {
    console.error("Error en getMortgageIncomeRatio:", err);
    res.status(500).json({ error: "Error al calcular ratio cuota/ingresos" });
  }
}
