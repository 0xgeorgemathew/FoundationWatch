// Description: Monitor Ethereum address for changes in balance

import { ethers } from "ethers";
const { formatUnits, parseEther } = ethers.utils;
import { spawn } from "child_process";

import WebSocket from "ws";
import dotenv from "dotenv";
import { sendMessageToChannel } from "./telegramBot";
import { printCurrentTime } from "./utils";

dotenv.config();

const watchAddress = process.env.WATCH_ADDRESS;
const WSS_URL = process.env.RPC_URL_WSS;
const HTTP_URL = process.env.RPC_URL_HTTPS;

if (!watchAddress) throw new Error("WATCH_ADDRESS must be provided");
if (!WSS_URL) throw new Error("RPC_URL must be provided");

let lastBalance = ethers.BigNumber.from(0);
let HTTPprovider = new ethers.providers.JsonRpcProvider(HTTP_URL);
let WSSprovider = new ethers.providers.WebSocketProvider(WSS_URL);

async function checkBalance() {
  try {
    lastBalance = await HTTPprovider.getBalance(watchAddress ?? "");
    const formattedBalance = parseFloat(formatUnits(lastBalance)).toFixed(2);
    console.log(`${printCurrentTime()}Balance: ${formattedBalance} ETH`);
    sendMessageToChannel(`*${formattedBalance} ETH* ${printCurrentTime()}`, {
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Error checking balance:", error);
  }
}

async function checkBalanceDelta() {
  try {
    const currentBalance = await WSSprovider.getBalance(watchAddress ?? "");
    const delta = lastBalance.sub(currentBalance);
    if (!delta.isZero()) {
      const formattedDelta = parseFloat(formatUnits(delta)).toFixed(2);
      const formattedCurrentBalance = parseFloat(
        formatUnits(currentBalance)
      ).toFixed(2);
      console.log(
        `${printCurrentTime()} - ${formattedDelta} ETH transferred. New balance: ${formattedCurrentBalance} ETH`
      );
      sendMessageToChannel(
        `*${formattedDelta} ETH transferred* \n\n New balance: ${formattedCurrentBalance} ETH \n\n ${printCurrentTime()}`,
        { parse_mode: "Markdown" }
      );
    }
    lastBalance = currentBalance;
  } catch (error) {
    console.error("Error checking balance delta:", error);
  }
}
function setupWebSocketProvider() {
  WSSprovider = new ethers.providers.WebSocketProvider(WSS_URL ?? "");

  WSSprovider.on("block", () => {
    checkBalanceDelta();
  });

  WSSprovider._websocket.on("close", () => {
    console.log("Disconnected. Reconnecting...");

    setTimeout(setupWebSocketProvider, 3000);
  });

  WSSprovider._websocket.on("error", (error: any) => {
    console.log("WebSocket error:", error);
  });

  WSSprovider._websocket.on("open", () => {
    console.log("Connected successfully.");
  });
}
async function startWebhookServer() {
  const isProduction = process.env.NODE_ENV === "production";
  const webhookServerPath = isProduction
    ? "webhookServer.js"
    : "dist/webhookServer.js";
  const webhookServerProcess = spawn("node", [webhookServerPath], {
    stdio: ["inherit", "inherit", "inherit", "ipc"],
  });

  webhookServerProcess.on("message", (message: any) => {
    message.data.event.activity.forEach((activity: any) => {
      console.log(`${activity.asset} ${activity.value}`);
      console.log(`https://etherscan.io/tx/${activity.hash}`);
      sendMessageToChannel(`*${activity.asset} * ${activity.value}`, {
        parse_mode: "Markdown",
      });
      sendMessageToChannel(`https://etherscan.io/tx/${activity.hash}`);
    });
  });
}

async function main() {
  setupWebSocketProvider();
  await checkBalance();
  startWebhookServer();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
