#  Proyecto Escuela de Conductores 
Proyecto semestral ISW 2026-1

¡Hola equipo! Bienvenidos al repositorio oficial del proyecto. 

Para asegurar que todos trabajemos con las mismas versiones, sin conflictos en nuestros equipos y sin perder horas instalando cosas, hemos estandarizado el entorno de desarrollo utilizando **Docker**. No necesitan instalar Node.js ni PostgreSQL físicamente.

---

## 1. Requisitos Previos

Antes de escribir la primera línea de código, asegúrense de tener esto instalado:

1. **GitHub Desktop:** Para descargar el código. ([Descargar aquí](https://desktop.github.com/download/))
2. **Docker Desktop:** El motor de contenedores. ([Descargar aquí](https://www.docker.com/products/docker-desktop/))

---

## 2. Inicializar el Entorno (Primera vez)

Abran una terminal en su computadora (Símbolo del sistema, PowerShell) y diriganse a la dirección donde desean guardar el proyecto, en este caso pongo un ejemplo de dirección en el escritorio (deben cambiar el nombre de usuario según su equipo) y sigan estos pasos:

2.1. **Clonar el repositorio:**

    cd C:\Users\benja\Desktop\
    git clone https://github.com/benjaminosesgonzalez/escuela-conductores.git
    

2.2 **Levantar el entorno:** (Debe ser dentro de la carpeta descargada)

    cd C:\Users\benja\Desktop\escuela-conductores
    docker-compose up -d --build

---

## 3. Accesos y Puertos

Una vez que la terminal termine, tendrán los siguientes servicios corriendo en su equipo. Accedan desde su navegador:

     Frontend (React + Vite): http://localhost:5173

     Backend (API Express): http://localhost:3000

     Base de Datos (pgAdmin4): http://localhost:5050