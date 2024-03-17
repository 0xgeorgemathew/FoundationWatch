# Base image - Choose appropriate Node.js version
FROM node:20-alpine

# Working directory within the container
WORKDIR /app

# Copy necessary dependencies
COPY package*.json ./

# Install dependencies 
RUN npm install

# Copy the rest of the source code
COPY dist/ ./ 

# Expose a default port for your Node.js applications
EXPOSE 3000  

# Command to run when the container starts (adapt as needed)
CMD ["node", "dist/telegramBot.js"] 
