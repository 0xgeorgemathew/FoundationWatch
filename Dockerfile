# Base image
FROM node:20-alpine

# Working directory
WORKDIR /app

# Copy dependencies definition
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy transpiled code
COPY dist ./ 

# Expose port (if needed)
EXPOSE 3000  

