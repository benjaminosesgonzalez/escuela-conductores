import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { AppDataSource, connectDB } from "./config/configDb.js";
import { routerApi } from "./routes/index.routes.js";
import { inicializarScheduler } from "./services/clase-online-scheduler.service.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(morgan("dev"));

// CORS - Esto es importante para que el frontend pueda conectarse
app.use(cors({
  origin: "http://localhost:5173", // Tu puerto del frontend (ajusta si es diferente)
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Ruta principal de bienvenida
app.get("/", (req, res) => {
  res.send("¡Bienvenido a mi API REST con TypeORM!");
});

// Cargar todas las rutas API
routerApi(app);

// Inicializa la conexión a la base de datos
connectDB()
  .then(() => {
    console.log("✅ Conexión exitosa a la base de datos PostgreSQL!");

    // Inicializar scheduler de generación de clases
    inicializarScheduler();

    // Levanta el servidor Express
    const PORT = process.env.PORT || 5000; // Cambié a 5000 como en tu frontend
    app.listen(PORT, () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("❌ Error al conectar con la base de datos:", error);
    process.exit(1);
  });