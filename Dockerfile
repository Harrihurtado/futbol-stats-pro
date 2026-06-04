
# ✅ CORRECCIÓN ERROR 1: Imagen actualizada a node:24-slim (ligera, segura, compatible con el requisito)
FROM node:24-slim
 
WORKDIR /app
 
COPY package*.json ./
 
RUN npm install
 
COPY . .
 
# ✅ CORRECCIÓN ERROR 2: Puerto corregido a 3000, que es el que usa app.js
EXPOSE 3000
 
CMD ["npm", "start"]