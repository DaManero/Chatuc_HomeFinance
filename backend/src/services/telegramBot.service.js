import TelegramBot from "node-telegram-bot-api";
import { env } from "../config/env.js";
import messageParserService from "./messageParser.service.js";
import UserTelegramLink from "../models/userTelegramLink.model.js";
import PendingTransaction from "../models/pendingTransaction.model.js";

class TelegramBotService {
  constructor() {
    this.bot = null;
  }

  /**
   * Inicializar el bot
   */
  initialize() {
    if (!env.TELEGRAM_BOT_TOKEN) {
      console.log("⚠️  TELEGRAM_BOT_TOKEN no configurado - Bot deshabilitado");
      return;
    }

    try {
      // Crear instancia del bot con polling
      this.bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, {
        polling: {
          interval: 1000,
          autoStart: true,
          params: {
            timeout: 10,
          },
        },
      });

      // Manejar errores de polling para evitar que caiga el servidor
      this.bot.on("polling_error", (error) => {
        console.error("⚠️  Telegram polling error:", error.message);
        // No lanzar el error para evitar que caiga el servidor
      });

      // Manejar errores generales del bot
      this.bot.on("error", (error) => {
        console.error("⚠️  Telegram bot error:", error.message);
      });

      this.setupCommands();
      this.setupMessageHandler();

      console.log("✓ Telegram bot initialized");
    } catch (error) {
      console.error("❌ Error al inicializar Telegram bot:", error);
    }
  }

  /**
   * Configurar comandos del bot
   */
  setupCommands() {
    // Comando /start
    this.bot.onText(/\/start/, async (msg) => {
      try {
        const chatId = msg.chat.id;
        const welcomeMessage = `
¡Bienvenido a Home Finance Bot! 💰

Podés enviar tus gastos de forma rápida. Por ejemplo:

📝 Ejemplos:
• "Supermercado 5000"
• "Nafta 15000"
• "Almuerzo 3500 USD"
• "Ingreso sueldo 500000"

El bot detectará automáticamente:
✓ El monto
✓ La moneda (ARS por defecto)
✓ El tipo (Egreso/Ingreso)
✓ La categoría sugerida

Luego podés procesarlos desde el sistema web.

Para vincular tu cuenta, usá:
/vincular TU_USER_ID

Comandos:
/help - Ver esta ayuda
/estado - Ver tus transacciones pendientes
      `;

        await this.bot.sendMessage(chatId, welcomeMessage);
      } catch (error) {
        console.error("Error en comando /start:", error);
      }
    });

    // Comando /help
    this.bot.onText(/\/help/, async (msg) => {
      try {
        const chatId = msg.chat.id;
        await this.bot.sendMessage(
          chatId,
          "Enviá /start para ver la ayuda completa"
        );
      } catch (error) {
        console.error("Error en comando /help:", error);
      }
    });

    // Comando /vincular
    this.bot.onText(/\/vincular (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = parseInt(match[1]);
      const username = msg.from.username || null;

      try {
        // Buscar o crear la vinculación en la BD
        const [link, created] = await UserTelegramLink.findOrCreate({
          where: { telegramChatId: chatId.toString() },
          defaults: {
            userId,
            telegramChatId: chatId.toString(),
            telegramUsername: username,
            isActive: true,
          },
        });

        if (!created) {
          // Actualizar si ya existía
          await link.update({
            userId,
            telegramUsername: username,
            isActive: true,
          });
        }

        await this.bot.sendMessage(
          chatId,
          `✓ Cuenta vinculada correctamente!\n\nAhora podés enviar tus gastos y se guardarán en tu cuenta (ID: ${userId})`
        );
      } catch (error) {
        console.error("Error al vincular cuenta:", error);
        try {
          await this.bot.sendMessage(
            chatId,
            "❌ Error al vincular la cuenta. Verificá que el ID de usuario sea correcto."
          );
        } catch (e) {
          console.error("Error al enviar mensaje de error:", e);
        }
      }
    });

    // Comando /estado
    this.bot.onText(/\/estado/, async (msg) => {
      const chatId = msg.chat.id;

      try {
        const link = await UserTelegramLink.findOne({
          where: { telegramChatId: chatId.toString(), isActive: true },
        });

        if (!link) {
          await this.bot.sendMessage(
            chatId,
            "❌ Primero vinculá tu cuenta con: /vincular TU_USER_ID"
          );
          return;
        }

        // Obtener estadísticas de transacciones pendientes
        const pendingCount = await PendingTransaction.count({
          where: {
            userId: link.userId,
            status: "pending",
          },
        });

        await this.bot.sendMessage(
          chatId,
          `📊 Estado de tu cuenta\n\n✓ Cuenta vinculada: ${link.userId}\n⏳ Transacciones pendientes: ${pendingCount}\n\nPodés procesarlas en el sistema web.`
        );
      } catch (error) {
        console.error("Error al obtener estado:", error);
        try {
          await this.bot.sendMessage(chatId, "❌ Error al obtener el estado");
        } catch (e) {
          console.error("Error al enviar mensaje de error:", e);
        }
      }
    });
  }

  /**
   * Configurar handler para mensajes normales (no comandos)
   */
  setupMessageHandler() {
    this.bot.on("message", async (msg) => {
      try {
        // Ignorar comandos (comienzan con /)
        if (!msg.text || msg.text.startsWith("/")) {
          return;
        }

        const chatId = msg.chat.id;
        const messageText = msg.text;

        // Buscar la vinculación en la BD
        const link = await UserTelegramLink.findOne({
          where: { telegramChatId: chatId.toString(), isActive: true },
        });

        if (!link) {
          await this.bot.sendMessage(
            chatId,
            "❌ Primero vinculá tu cuenta con: /vincular TU_USER_ID\n\nPodés encontrar tu ID en el sistema web, en tu perfil de usuario."
          );
          return;
        }

        const userId = link.userId;

        // Parsear el mensaje
        const parsed = messageParserService.parseMessage(messageText);

        if (!messageParserService.isValid(parsed)) {
          await this.bot.sendMessage(
            chatId,
            "❌ No pude detectar un monto válido en tu mensaje.\n\nIntentá con un formato como:\n• Supermercado 5000\n• Nafta 15000 USD"
          );
          return;
        }

        // Crear transacción pendiente directamente en la BD
        const pendingTransaction = await PendingTransaction.create({
          rawMessage: messageText,
          amount: parsed.amount,
          currency: parsed.currency,
          type: parsed.type,
          suggestedCategory: parsed.suggestedCategory,
          description: parsed.description,
          transactionDate: new Date(),
          status: "pending",
          userId: userId,
          telegramChatId: chatId.toString(),
          telegramMessageId: msg.message_id.toString(),
        });

        // Formatear respuesta
        let confirmMessage = `✓ Gasto registrado! (#${pendingTransaction.id})\n\n`;
        confirmMessage += `💵 Monto: ${
          parsed.currency === "USD" ? "U$S" : "$"
        } ${parsed.amount?.toLocaleString("es-AR")}\n`;
        confirmMessage += `📁 Tipo: ${parsed.type}\n`;

        if (parsed.suggestedCategory) {
          confirmMessage += `🏷️ Categoría: ${parsed.suggestedCategory}\n`;
        }

        if (parsed.description) {
          confirmMessage += `📝 Descripción: ${parsed.description}\n`;
        }

        confirmMessage += `\n⏳ Procesalo desde el sistema web para confirmar.`;

        await this.bot.sendMessage(chatId, confirmMessage);
      } catch (error) {
        console.error("Error al procesar mensaje:", error);
        try {
          await this.bot.sendMessage(
            msg.chat.id,
            "❌ Error al guardar el gasto. Intentá nuevamente."
          );
        } catch (e) {
          console.error("Error al enviar mensaje de error:", e);
        }
      }
    });
  }

  /**
   * Obtener el bot (para uso externo si es necesario)
   */
  getBot() {
    return this.bot;
  }

  /**
   * Detener el bot
   */
  stop() {
    if (this.bot) {
      this.bot.stopPolling();
      console.log("✓ Telegram bot stopped");
    }
  }
}

// Exportar instancia única
export default new TelegramBotService();
