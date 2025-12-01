import { models } from "../models/index.js";
import { Op } from "sequelize";

function getTodayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function createInvestment(req, res) {
  const t = await models.Investment.sequelize.transaction();

  try {
    const {
      type,
      amount,
      currency,
      exchangeRate,
      exchangeAmount,
      exchangeCurrency,
      startDate,
      endDate,
      interestRate,
      entity,
      description,
    } = req.body;
    const userId = req.user.userId;

    if (!type || !amount || !currency || !entity) {
      await t.rollback();
      return res.status(400).json({
        error: "Tipo, monto, moneda y entidad son requeridos",
      });
    }

    // Crear la inversión
    const investment = await models.Investment.create(
      {
        type,
        amount,
        currency,
        exchangeRate,
        exchangeAmount,
        exchangeCurrency,
        startDate: startDate || getTodayLocalDate(),
        endDate,
        interestRate,
        status: "Activo",
        entity,
        description,
        userId,
      },
      { transaction: t }
    );

    // Si es compra o venta de divisas, crear las 2 transacciones automáticas
    if (type === "Compra Divisa" || type === "Venta Divisa") {
      if (!exchangeRate || !exchangeAmount || !exchangeCurrency) {
        await t.rollback();
        return res.status(400).json({
          error:
            "Para compra/venta de divisas se requiere tipo de cambio, monto y moneda de intercambio",
        });
      }

      if (type === "Compra Divisa") {
        // Buscar categoría "Compra Dolar" para el egreso
        let compraDolarCategory = await models.Category.findOne({
          where: {
            userId,
            name: { [Op.like]: "%Compra%Dolar%" },
          },
          transaction: t,
        });

        if (!compraDolarCategory) {
          compraDolarCategory = await models.Category.create(
            {
              name: "Compra Dolar",
              type: "Egreso",
              userId,
            },
            { transaction: t }
          );
        }

        // Buscar o crear categoría "Inversiones" para el ingreso
        let investmentCategory = await models.Category.findOne({
          where: {
            userId,
            name: { [Op.like]: "%Inversión%" },
          },
          transaction: t,
        });

        if (!investmentCategory) {
          investmentCategory = await models.Category.create(
            {
              name: "Inversiones",
              type: "Ingreso",
              userId,
            },
            { transaction: t }
          );
        }

        // Ejemplo: Compro USD 100 a $1.200 (pago $120.000 pesos)
        // Egreso en pesos con categoría "Compra Dolar"
        await models.Transaction.create(
          {
            amount: exchangeAmount, // Monto en pesos que pago
            date: startDate || getTodayLocalDate(),
            description: `Compra de ${currency} - ${entity}${
              description ? ` - ${description}` : ""
            }`,
            type: "Egreso",
            currency: exchangeCurrency, // ARS
            categoryId: compraDolarCategory.id,
            userId,
          },
          { transaction: t }
        );

        // Ingreso en dólares
        await models.Transaction.create(
          {
            amount, // Monto en dólares que recibo
            date: startDate || getTodayLocalDate(),
            description: `Compra de ${currency} - ${entity}${
              description ? ` - ${description}` : ""
            }`,
            type: "Ingreso",
            currency, // USD
            categoryId: investmentCategory.id,
            userId,
          },
          { transaction: t }
        );
      } else {
        // Venta Divisa
        // Buscar o crear categoría "Inversiones"
        let investmentCategory = await models.Category.findOne({
          where: {
            userId,
            name: { [Op.like]: "%Inversión%" },
          },
          transaction: t,
        });

        if (!investmentCategory) {
          investmentCategory = await models.Category.create(
            {
              name: "Inversiones",
              type: "Ingreso",
              userId,
            },
            { transaction: t }
          );
        }

        // Ejemplo: Vendo USD 100 a $1.200 (recibo $120.000 pesos)
        // Egreso en dólares
        await models.Transaction.create(
          {
            amount, // Monto en dólares que vendo
            date: startDate || getTodayLocalDate(),
            description: `Venta de ${currency} - ${entity}${
              description ? ` - ${description}` : ""
            }`,
            type: "Egreso",
            currency, // USD
            categoryId: investmentCategory.id,
            userId,
          },
          { transaction: t }
        );

        // Ingreso en pesos
        await models.Transaction.create(
          {
            amount: exchangeAmount, // Monto en pesos que recibo
            date: startDate || getTodayLocalDate(),
            description: `Venta de ${currency} - ${entity}${
              description ? ` - ${description}` : ""
            }`,
            type: "Ingreso",
            currency: exchangeCurrency, // ARS
            categoryId: investmentCategory.id,
            userId,
          },
          { transaction: t }
        );
      }
    }

    await t.commit();

    res.status(201).json({
      message: "Inversión creada exitosamente",
      investment,
    });
  } catch (err) {
    await t.rollback();
    console.error("Error en createInvestment:", err);
    res.status(500).json({ error: "Error al crear inversión" });
  }
}

export async function getInvestments(req, res) {
  try {
    const { type, status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }

    const investments = await models.Investment.findAll({
      where,
      include: [
        {
          model: models.InvestmentEarning,
          as: "earnings",
          attributes: ["amount"],
          required: false, // LEFT JOIN para incluir inversiones sin rendimientos
        },
      ],
      order: [["startDate", "DESC"]],
    });

    // Calcular total de rendimientos para cada inversión
    const investmentsWithEarnings = investments.map((inv) => {
      const investment = inv.toJSON();
      const totalEarnings = (investment.earnings || []).reduce(
        (sum, e) => sum + parseFloat(e.amount || 0),
        0
      );
      return {
        ...investment,
        totalEarnings: totalEarnings,
      };
    });

    res.json(investmentsWithEarnings);
  } catch (err) {
    console.error("Error en getInvestments:", err);
    res.status(500).json({ error: "Error al obtener inversiones" });
  }
}

export async function getInvestmentById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const investment = await models.Investment.findOne({
      where: { id },
    });

    if (!investment) {
      return res.status(404).json({ error: "Inversión no encontrada" });
    }

    res.json(investment);
  } catch (err) {
    console.error("Error en getInvestmentById:", err);
    res.status(500).json({ error: "Error al obtener inversión" });
  }
}

export async function updateInvestment(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    const investment = await models.Investment.findOne({
      where: { id },
    });

    if (!investment) {
      return res.status(404).json({ error: "Inversión no encontrada" });
    }

    // No permitir cambiar el tipo si ya tiene transacciones asociadas
    if (
      updateData.type &&
      updateData.type !== investment.type &&
      (investment.type === "Compra Divisa" ||
        investment.type === "Venta Divisa")
    ) {
      return res.status(400).json({
        error:
          "No se puede cambiar el tipo de una inversión de compra/venta de divisas",
      });
    }

    await investment.update(updateData);

    res.json({
      message: "Inversión actualizada exitosamente",
      investment,
    });
  } catch (err) {
    console.error("Error en updateInvestment:", err);
    res.status(500).json({ error: "Error al actualizar inversión" });
  }
}

export async function deleteInvestment(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const investment = await models.Investment.findOne({
      where: { id },
    });

    if (!investment) {
      return res.status(404).json({ error: "Inversión no encontrada" });
    }

    // Advertencia: Las transacciones creadas automáticamente NO se eliminan
    // El usuario debe eliminarlas manualmente si lo desea

    await investment.destroy();

    res.json({ message: "Inversión eliminada exitosamente" });
  } catch (err) {
    console.error("Error en deleteInvestment:", err);
    res.status(500).json({ error: "Error al eliminar inversión" });
  }
}

export async function registerEarning(req, res) {
  const t = await models.Investment.sequelize.transaction();

  try {
    const { id } = req.params;
    const { amount, earningDate, notes } = req.body;
    const userId = req.user.userId;

    if (!amount || !earningDate) {
      await t.rollback();
      return res.status(400).json({
        error: "Monto y fecha son requeridos",
      });
    }

    // Verificar que la inversión existe y es del usuario
    const investment = await models.Investment.findOne({
      where: { id },
      transaction: t,
    });

    if (!investment) {
      await t.rollback();
      return res.status(404).json({ error: "Inversión no encontrada" });
    }

    // Buscar o crear categoría "Inversiones"
    let investmentCategory = await models.Category.findOne({
      where: {
        userId,
        name: { [Op.like]: "%Inversión%" },
      },
      transaction: t,
    });

    if (!investmentCategory) {
      investmentCategory = await models.Category.create(
        {
          name: "Inversiones",
          type: "Ingreso",
          userId,
        },
        { transaction: t }
      );
    }

    // Crear la transacción de ingreso
    const incomeTransaction = await models.Transaction.create(
      {
        amount,
        date: earningDate,
        description: `Rendimiento ${investment.type} - ${investment.entity}${
          notes ? ` - ${notes}` : ""
        }`,
        type: "Ingreso",
        currency: investment.currency,
        categoryId: investmentCategory.id,
        userId,
      },
      { transaction: t }
    );

    // Registrar el rendimiento
    const earning = await models.InvestmentEarning.create(
      {
        investmentId: id,
        amount,
        currency: investment.currency,
        earningDate,
        notes,
        transactionId: incomeTransaction.id,
        userId,
      },
      { transaction: t }
    );

    await t.commit();

    res.status(201).json({
      message: "Rendimiento registrado exitosamente",
      earning,
    });
  } catch (err) {
    await t.rollback();
    console.error("Error en registerEarning:", err);
    res.status(500).json({ error: "Error al registrar rendimiento" });
  }
}

export async function getEarnings(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const investment = await models.Investment.findOne({
      where: { id },
    });

    if (!investment) {
      return res.status(404).json({ error: "Inversión no encontrada" });
    }

    const earnings = await models.InvestmentEarning.findAll({
      where: { investmentId: id },
      order: [["earningDate", "DESC"]],
    });

    res.json(earnings);
  } catch (err) {
    console.error("Error en getEarnings:", err);
    res.status(500).json({ error: "Error al obtener rendimientos" });
  }
}
