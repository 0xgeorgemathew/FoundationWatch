#!/bin/bash

# Navigate to the application directory
cd /home/ec2-user/fwatchbot/
# Load environment variables from the .env file
if [ -f .env ]; then
  export $(cat .env | xargs)
fi
echo "RPC_URL: $RPC_URL"
echo "TELEGRAM_BOT_TOKEN: $TELEGRAM_BOT_TOKEN"
echo "WATCH_ADDRESS: $WATCH_ADDRESS"
# Install dependencies
npm install
# Compile TypeScript to JavaScript
npm run build

# Restart the application using PM2
pm2 restart all || pm2 start dist/monitorBalance.js --name foundation-watcher

# If you're not using PM2, you can use other methods to start your application,
# such as `node dist/monitorContract.js` or using a process manager like forever or nodemon.
