"use strict";
// Description: Monitor Ethereum address for changes in balance
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const ws_1 = __importDefault(require("ws"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const telegramBot_1 = require("./telegramBot");
const watchAddress = process.env.WATCH_ADDRESS; // EthDev contract address
const RPC_URL = process.env.RPC_URL;
let lastBalance = (0, ethers_1.parseEther)("0");
if (!watchAddress)
    throw new Error("WATCH_ADDRESS must be provided");
if (!RPC_URL)
    throw new Error("RPC_URL must be provided");
function printCurrentTime() {
    const options = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
    };
    const currentTime = new Date();
    return currentTime.toLocaleTimeString("en-IN", options);
}
async function listenForNewBlocks() {
    console.log(`Monitoring ETH Balance for ${watchAddress} `);
    provider.on("block", () => {
        checkBalanceDelta();
    });
}
async function checkBalance() {
    lastBalance = await provider.getBalance(watchAddress ?? "");
    console.log(`${printCurrentTime()}`);
    console.log(`Balance: ${Number((0, ethers_1.formatUnits)(lastBalance)).toFixed(2)} ETH`);
    const message = `*Balance: ${Number((0, ethers_1.formatUnits)(lastBalance)).toFixed(2)} ETH* \n\n ${printCurrentTime()}`;
    (0, telegramBot_1.sendMessageToChannel)(message, { parse_mode: "Markdown" });
    await listenForNewBlocks();
}
function createWebSocket() {
    const ws = new ws_1.default(RPC_URL ?? "");
    ws.on("close", () => {
        (0, telegramBot_1.sendMessageToChannel)("WebSocket connection closed");
        console.log("Disconnected. Reconnecting...");
        setTimeout(() => {
            provider = new ethers_1.ethers.WebSocketProvider(createWebSocket());
            checkBalance();
        }, 3000);
    });
    ws.on("error", (error) => {
        console.log("WebSocket error: ", error);
        (0, telegramBot_1.sendMessageToChannel)("WebSocket error: ");
    });
    ws.on("open", () => {
        console.log("Connected successfully.");
        (0, telegramBot_1.sendMessageToChannel)("Connected successfully.");
    });
    return ws;
}
// Set up a provider to connect to an Ethereum node
let provider = new ethers_1.ethers.WebSocketProvider(createWebSocket());
async function checkBalanceDelta() {
    try {
        const currentBalance = await provider.getBalance(watchAddress ?? "");
        const delta = lastBalance - currentBalance;
        if (currentBalance != lastBalance) {
            console.log(` ${Number((0, ethers_1.formatUnits)(delta)).toFixed(2)} ETH transferred \n\n New balance: ${Number((0, ethers_1.formatUnits)(currentBalance)).toFixed(2)} ETH \n\n ${printCurrentTime()}`);
            const message = ` *${Number((0, ethers_1.formatUnits)(delta)).toFixed(2)} Ether transferred \n\n New balance: ${Number((0, ethers_1.formatUnits)(currentBalance)).toFixed(2)} ETH* \n\n ${printCurrentTime()}`;
            (0, telegramBot_1.sendMessageToChannel)(message, { parse_mode: "Markdown" });
        }
        lastBalance = currentBalance;
    }
    catch (error) {
        console.error("Error checking balance delta:", error);
    }
}
async function main() {
    // // Close the WebSocket connection after 10 seconds to test reconnection logic
    // setTimeout(() => {
    //   console.log(
    //     "Forcing WebSocket disconnection to test reconnection logic..."
    //   );
    //   provider.websocket?.close();
    // }, 10000);
    await checkBalance();
}
// main function
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
