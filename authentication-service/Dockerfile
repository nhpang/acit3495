FROM node:18
WORKDIR /app
COPY package.json ./
RUN npm install
RUN npm install cors
COPY . .
CMD ["node", "server.js"]
EXPOSE 5000
