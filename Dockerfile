# Base image
FROM node:20-alpine

# Working directory
WORKDIR /app

# Copy dependencies definition
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install pm2 -g


# Copy transpiled code
COPY dist ./ 

# Expose port (if needed)
EXPOSE 3000  

CMD ["pm2-runtime","monitorBalance.js"]