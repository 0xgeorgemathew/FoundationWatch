#!/bin/bash

# Navigate to the application directory
cd /home/ec2-user/fwatchbot/FoundationWatch

# Load environment variables from the .env file
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

# Install dependencies
npm install
# Compile TypeScript to JavaScript
npm run build

# Restart the application using PM2
pm2 restart all || pm2 start dist/monitorContract.js --name ethereum-monitor

# If you're not using PM2, you can use other methods to start your application,
# such as `node dist/monitorContract.js` or using a process manager like forever or nodemon.
