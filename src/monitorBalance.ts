// Description: Monitor Ethereum address for changes in balance

import { ethers } from "ethers";
const { formatUnits, parseEther } = ethers.utils;

import WebSocket from "ws";
import dotenv from "dotenv";
dotenv.config();

import { sendMessageToChannel } from "./telegramBot";

const watchAddress = process.env.WATCH_ADDRESS; // EthDev contract address
const RPC_URL = process.env.RPC_URL;
let lastBalance = parseEther("0");

if (!watchAddress) throw new Error("WATCH_ADDRESS must be provided");
if (!RPC_URL) throw new Error("RPC_URL must be provided");

function printCurrentTime() {
  const options: Intl.DateTimeFormatOptions = {
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

  console.log(`Balance: ${Number(formatUnits(lastBalance)).toFixed(2)} ETH`);
  const message = `*Balance: ${Number(formatUnits(lastBalance)).toFixed(
    2
  )} ETH* \n\n ${printCurrentTime()}`;

  sendMessageToChannel(message, { parse_mode: "Markdown" });
  await listenForNewBlocks();
}

function createWebSocket() {
  const ws = new WebSocket(RPC_URL ?? "");
  ws.on("close", () => {
    sendMessageToChannel("WebSocket connection closed");
    console.log("Disconnected. Reconnecting...");
    setTimeout(() => {
      provider = new ethers.providers.WebSocketProvider(createWebSocket());
      checkBalance();
    }, 3000);
  });
  ws.on("error", (error: any) => {
    console.log("WebSocket error: ", error);
    sendMessageToChannel("WebSocket error: ");
  });
  ws.on("open", () => {
    console.log("Connected successfully.");
    sendMessageToChannel("Connected successfully.");
  });
  return ws;
}
// Set up a provider to connect to an Ethereum node
let provider = new ethers.providers.WebSocketProvider(createWebSocket());

async function checkBalanceDelta() {
  try {
    const currentBalance = await provider.getBalance(watchAddress ?? "");
    const delta = lastBalance.sub(currentBalance);
    if (!delta.isZero()) {
      console.log(
        ` ${Number(formatUnits(delta)).toFixed(
          2
        )} ETH transferred \n\n New balance: ${Number(
          formatUnits(currentBalance)
        ).toFixed(2)} ETH \n\n ${printCurrentTime()}`
      );
      const message = ` *${Number(formatUnits(delta)).toFixed(
        2
      )} Ether transferred \n\n New balance: ${Number(
        formatUnits(currentBalance)
      ).toFixed(2)} ETH* \n\n ${printCurrentTime()}`;

      sendMessageToChannel(message, { parse_mode: "Markdown" });
    }
    lastBalance = currentBalance;
  } catch (error) {
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
