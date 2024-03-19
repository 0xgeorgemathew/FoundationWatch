# Base image
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install pm2 -g


COPY dist ./ 
ENV NODE_ENV=production


EXPOSE 3000  
CMD ["pm2-runtime","monitorBalance.js"]