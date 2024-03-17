"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageToChannel = void 0;
// src/telegramBot.ts
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = -1002053473291;
if (!botToken) {
    throw new Error("Telegram bot token must be provided");
}
const bot = new node_telegram_bot_api_1.default(botToken);
function sendMessageToChannel(message, options = {}) {
    bot.sendMessage(chatId, message, options);
}
exports.sendMessageToChannel = sendMessageToChannel;
