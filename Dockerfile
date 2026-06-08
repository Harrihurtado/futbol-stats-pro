# ✅ CORRECCIÓN ERROR 2: Imagen actualizada a node:24-slim (ligera, segura y óptima)
FROM node:24-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# ✅ CORRECCIÓN ERROR 3: Puerto corregido a 3000, que es el que usa app.js
EXPOSE 3000

CMD ["npm", "start"]
