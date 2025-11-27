/**
 * Servicio para parsear mensajes de Telegram y extraer información de transacciones
 */

class MessageParserService {
  /**
   * Parsea un mensaje de Telegram y extrae información de transacción
   * @param {string} message - Mensaje original
   * @returns {object} - Datos extraídos
   */
  parseMessage(message) {
    const result = {
      amount: null,
      currency: "ARS",
      type: "Egreso", // Por defecto, los gastos son más comunes
      suggestedCategory: null,
      description: null,
    };

    // Limpiar el mensaje
    const cleanMessage = message.trim();

    // 1. Detectar moneda (USD, U$S, dolares, etc.)
    const currencyPatterns = [
      /\b(usd|u\$s|dolar|dolares|dólar|dólares)\b/i,
      /\$\s*usd/i,
    ];

    for (const pattern of currencyPatterns) {
      if (pattern.test(cleanMessage)) {
        result.currency = "USD";
        break;
      }
    }

    // 2. Detectar tipo (Ingreso vs Egreso)
    const ingresoPatterns = [
      /\b(ingreso|cobro|cobré|cobre|ganancia|sueldo|salario|pago recibido)\b/i,
      /^\+/,
    ];

    for (const pattern of ingresoPatterns) {
      if (pattern.test(cleanMessage)) {
        result.type = "Ingreso";
        break;
      }
    }

    // 3. Extraer monto
    // Patrones: "5000", "$5000", "5.000", "5,000.50", etc.
    const amountPatterns = [
      /\$?\s*(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?)/, // Con separadores de miles: 5.000 o 5,000.50
      /\$?\s*(\d+(?:[.,]\d{2})?)/, // Sin separadores: 5000 o 5000.50
    ];

    for (const pattern of amountPatterns) {
      const match = cleanMessage.match(pattern);
      if (match) {
        let amountStr = match[1];

        // Detectar si usa punto o coma como separador decimal
        // Si hay múltiples puntos o comas, son separadores de miles
        const dotCount = (amountStr.match(/\./g) || []).length;
        const commaCount = (amountStr.match(/,/g) || []).length;

        if (dotCount > 1 || (dotCount === 1 && commaCount === 1)) {
          // Formato europeo: 5.000,50 -> quitar puntos, convertir coma a punto
          amountStr = amountStr.replace(/\./g, "").replace(/,/g, ".");
        } else if (commaCount > 1 || (commaCount === 1 && dotCount === 1)) {
          // Formato americano: 5,000.50 -> quitar comas
          amountStr = amountStr.replace(/,/g, "");
        } else if (commaCount === 1) {
          // Solo una coma: podría ser decimal (5,50) o miles (5,000)
          // Si tiene 3 dígitos después de la coma, es separador de miles
          if (/,\d{3}$/.test(amountStr)) {
            amountStr = amountStr.replace(/,/g, "");
          } else {
            amountStr = amountStr.replace(/,/g, ".");
          }
        } else if (dotCount === 1) {
          // Solo un punto: podría ser decimal (5.50) o miles (5.000)
          // Si tiene 3 dígitos después del punto, es separador de miles
          if (/\.\d{3}$/.test(amountStr)) {
            amountStr = amountStr.replace(/\./g, "");
          }
          // Si tiene 1 o 2 dígitos, ya es decimal correcto
        }

        result.amount = parseFloat(amountStr);
        if (!isNaN(result.amount) && result.amount > 0) {
          break;
        }
      }
    }

    // 4. Detectar categoría sugerida
    const categoryKeywords = {
      Supermercado: [
        /\b(super|supermercado|almacen|despensa|carrefour|coto|dia|disco)\b/i,
      ],
      Transporte: [
        /\b(nafta|combustible|gasoil|gas oil|colectivo|subte|taxi|uber|cabify|peaje)\b/i,
      ],
      Salud: [/\b(farmacia|medico|doctor|clinica|hospital|salud)\b/i],
      Entretenimiento: [
        /\b(cine|netflix|spotify|disney|hbo|streaming|juego|game)\b/i,
      ],
      Servicios: [
        /\b(luz|agua|gas|internet|telefono|celular|cable|expensas)\b/i,
      ],
      Comida: [
        /\b(restaurant|restaurante|delivery|pedidos ya|rappi|comida|almuerzo|cena)\b/i,
      ],
      Educación: [/\b(curso|libro|educacion|universidad|colegio|escuela)\b/i],
      Ropa: [/\b(ropa|zapatillas|zapatos|remera|pantalon|vestido)\b/i],
      "Compra Dolar": [/\b(compra.*dolar|comprar.*usd)\b/i],
    };

    for (const [category, patterns] of Object.entries(categoryKeywords)) {
      for (const pattern of patterns) {
        if (pattern.test(cleanMessage)) {
          result.suggestedCategory = category;
          break;
        }
      }
      if (result.suggestedCategory) break;
    }

    // 5. Extraer descripción (remover el monto y moneda del mensaje)
    let description = cleanMessage
      .replace(/\$?\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/g, "")
      .replace(/\b(usd|u\$s|dolar|dolares|dólar|dólares|ars|pesos?)\b/gi, "")
      .replace(/^\s*[-+]\s*/g, "")
      .trim();

    // Si la descripción quedó muy corta o vacía, usar el mensaje original
    if (description.length < 3) {
      description = cleanMessage.substring(0, 100);
    }

    result.description = description;

    return result;
  }

  /**
   * Valida si un mensaje parseado tiene la información mínima necesaria
   * @param {object} parsed - Resultado del parsing
   * @returns {boolean}
   */
  isValid(parsed) {
    return parsed.amount !== null && parsed.amount > 0;
  }
}

export default new MessageParserService();
