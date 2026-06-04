import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";

import { connectDB } from "./config/configDb.js";
import { routerApi } from "./routes/index.routes.js";
import profesorRoutes from "./routes/profesor.js";
import repositorioRoutes from "./routes/repositorioRoutes.js";

const app = express();

// Middlewares
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(morgan("dev"));

// CORS - Esto es importante para que el frontend pueda conectarse
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Ruta principal de bienvenida
app.get("/", (req, res) => {
  res.send("¡Bienvenido a mi API REST con TypeORM!");
});

// Rutas específicas
app.use("/api/profesor", profesorRoutes);
app.use("/api/repositorio", repositorioRoutes);

// Cargar todas las rutas generales del proyecto
routerApi(app);

// Inicializa la conexión a la base de datos
connectDB()
  .then(() => {
    console.log("✅ Conexión exitosa a la base de datos PostgreSQL!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("❌ Error al conectar con la base de datos:", error);
    process.exit(1);
  });