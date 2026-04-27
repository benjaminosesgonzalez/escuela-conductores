# server/Dockerfile

# 1. Usamos la misma versión ligera de Node.js
FROM node:20-alpine

# 2. Carpeta de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiamos las recetas de dependencias
COPY package*.json ./

# 4. Instalamos las dependencias (Express, pg, cors, nodemon, etc.)
RUN npm install

# 5. Copiamos el resto del código del servidor
COPY . .

# 6. Exponemos el puerto 3000, que es donde vivirá tu API
EXPOSE 3000

# 7. Iniciamos el servidor usando el script de desarrollo (asegúrate de que en tu package.json del server diga "dev": "nodemon index.js")
CMD ["npm", "run", "dev"]