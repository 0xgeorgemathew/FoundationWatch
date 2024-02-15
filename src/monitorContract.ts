import { ethers, formatUnits, parseEther } from "ethers";

import dotenv from "dotenv";
dotenv.config();

// Define the Ethereum contract address you want to monitor
const contractAddress = "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe"; // EthDev contract address
const ALCHMEY_KEY = process.env.ALCHMEY_KEY;
// Set up a provider to connect to an Ethereum node
const provider = new ethers.WebSocketProvider(
  `wss://eth-mainnet.g.alchemy.com/v2/${ALCHMEY_KEY}`
);

// Function to check the balance of the contract and log if it decreases
let lastBalance = parseEther("0");
async function checkBalance() {
  const currentBalance = await provider.getBalance(contractAddress);
  if (currentBalance < lastBalance) {
    console.log(
      `Ether transferred out! New balance: ${formatUnits(currentBalance)} ETH`
    );
  }
  lastBalance = currentBalance;
}

// Main function to set up the monitoring
async function main() {
  // Initialize the last balance
  lastBalance = await provider.getBalance(contractAddress);
  console.log(`Initial balance: ${formatUnits(lastBalance)} ETH`);

  // Set up a listener for new blocks
  provider.on("block", () => {
    checkBalance();
  });

  console.log(
    `Monitoring contract at ${contractAddress} for outgoing Ether transactions...`
  );
}

// Run the main function
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
