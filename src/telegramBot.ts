// src/telegramBot.ts
import TelegramBot from "node-telegram-bot-api";

import dotenv from "dotenv";
dotenv.config();
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = -1002053473291;
if (!botToken) {
  throw new Error("Telegram bot token must be provided");
}

const bot = new TelegramBot(botToken);

export function sendMessageToChannel(
  message: string,
  options: TelegramBot.SendMessageOptions = {}
) {
  bot.sendMessage(chatId, message, options);
}
