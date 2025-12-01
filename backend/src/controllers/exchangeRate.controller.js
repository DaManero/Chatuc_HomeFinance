import { models } from "../models/index.js";

// Función para obtener cotización desde DolarApi
async function fetchFromDolarApi() {
  try {
    const response = await fetch("https://dolarapi.com/v1/dolares/blue");
    if (!response.ok) throw new Error("Error al obtener cotización");

    const data = await response.json();
    return {
      rate: parseFloat(data.venta), // Precio de venta del blue
      source: "blue",
      date: new Date().toISOString().split("T")[0],
    };
  } catch (error) {
    console.error("Error fetching from DolarApi:", error);
    return null;
  }
}

export async function getCurrentRate(req, res) {
  try {
    // Buscar la cotización más reciente
    const latestRate = await models.ExchangeRate.findOne({
      where: { currencyFrom: "USD", currencyTo: "ARS" },
      order: [["date", "DESC"]],
    });

    if (latestRate) {
      return res.json({
        rate: parseFloat(latestRate.rate),
        source: latestRate.source,
        date: latestRate.date,
        fromCache: true,
      });
    }

    // Si no hay cotización guardada, devolver un valor por defecto
    res.json({
      rate: 0,
      source: "none",
      date: new Date().toISOString().split("T")[0],
      fromCache: false,
      message: "No hay cotización registrada. Actualice la cotización.",
    });
  } catch (err) {
    console.error("Error en getCurrentRate:", err);
    res.status(500).json({ error: "Error al obtener cotización" });
  }
}

export async function updateRate(req, res) {
  try {
    const userId = req.user.userId;
    const { rate: manualRate, source: manualSource } = req.body;

    let rateData;

    if (manualRate) {
      // Cotización manual
      rateData = {
        rate: parseFloat(manualRate),
        source: manualSource || "manual",
        date: new Date().toISOString().split("T")[0],
      };
    } else {
      // Obtener de API
      rateData = await fetchFromDolarApi();
      if (!rateData) {
        return res.status(503).json({
          error: "No se pudo obtener la cotización de la API",
        });
      }
    }

    // Guardar en base de datos
    const exchangeRate = await models.ExchangeRate.create({
      currencyFrom: "USD",
      currencyTo: "ARS",
      rate: rateData.rate,
      source: rateData.source,
      date: rateData.date,
      userId,
    });

    res.json({
      message: "Cotización actualizada exitosamente",
      rate: parseFloat(exchangeRate.rate),
      source: exchangeRate.source,
      date: exchangeRate.date,
    });
  } catch (err) {
    console.error("Error en updateRate:", err);
    res.status(500).json({ error: "Error al actualizar cotización" });
  }
}

export async function getRateHistory(req, res) {
  try {
    const { limit = 30 } = req.query;

    const rates = await models.ExchangeRate.findAll({
      where: { currencyFrom: "USD", currencyTo: "ARS" },
      order: [["date", "DESC"]],
      limit: parseInt(limit),
    });

    res.json({ rates });
  } catch (err) {
    console.error("Error en getRateHistory:", err);
    res.status(500).json({ error: "Error al obtener histórico" });
  }
}
