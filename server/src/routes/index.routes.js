import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import planRoutes from "./plan.routes.js";
import alumnoRoutes from "./alumno.routes.js";
import disponibilidadRoutes from "./disponibilidad.routes.js";
import disponibilidadAlumnoRoutes from "./disponibilidad-alumno.routes.js";
import secretariaRoutes from "./secretaria.routes.js";
import profesorRoutes from "./profesor.routes.js";
import claseRoutes from "./clase.routes.js";
import claseOnlineRoutes from "./clase-online.routes.js";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/auth", authRoutes);
  router.use("/profile", profileRoutes);
  router.use("/plans", planRoutes);
  router.use("/alumnos", alumnoRoutes);
  router.use("/secretarias", secretariaRoutes);
  router.use("/profesores", profesorRoutes);
  router.use("/disponibilidades", disponibilidadRoutes);
  router.use("/disponibilidades-alumnos", disponibilidadAlumnoRoutes);
  router.use("/clases", claseRoutes);
  router.use("/clases-online", claseOnlineRoutes);
}
