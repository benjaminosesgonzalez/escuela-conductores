# client/Dockerfile

# 1. Usamos una versión ligera de Node.js
FROM node:20-alpine

# 2. Le decimos a Docker que trabaje dentro de la carpeta /app en su máquina virtual
WORKDIR /app

# 3. Copiamos los package.json primero (esto hace que Docker sea más rápido al reconstruir)
COPY package*.json ./

# 4. Instalamos las dependencias (React, Vite, Tailwind, etc.)
RUN npm install

# 5. Copiamos el resto de tu código
COPY . .

# 6. Exponemos el puerto 5173, que es el que usa Vite por defecto
EXPOSE 5173

# 7. Iniciamos el servidor. El "-- --host" es crucial para que Vite permita que tu navegador físico vea la web.
CMD ["npm", "run", "dev"]