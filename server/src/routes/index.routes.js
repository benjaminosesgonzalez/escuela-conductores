import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import planRoutes from "./plan.routes.js";
import alumnoRoutes from "./alumno.routes.js";
import disponibilidadRoutes from "./disponibilidad.routes.js";
import disponibilidadAlumnoRoutes from "./disponibilidad-alumno.routes.js";
import secretariaRoutes from "./secretaria.routes.js";
import claseRoutes from "./clase.routes.js";
import profesorRoutes from "./profesor.routes.js";
import sedeRoutes from "./sede.routes.js";
import autoRoutes from "./auto.routes.js";
import agendamientoRoutes from "./agendamiento.routes.js";
import solicitudAutoRoutes from "./solicitudAuto.routes.js";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/auth", authRoutes);
  router.use("/profile", profileRoutes);
  router.use("/plans", planRoutes);
  router.use("/sedes", sedeRoutes);
  router.use("/autos", autoRoutes);
  router.use("/alumnos", alumnoRoutes);
  router.use("/solicitudes-auto", solicitudAutoRoutes);
  router.use("/agendamiento", agendamientoRoutes);
  router.use("/secretarias", secretariaRoutes);
  router.use("/disponibilidades", disponibilidadRoutes);
  router.use("/disponibilidades-alumnos", disponibilidadAlumnoRoutes);
  router.use("/clases", claseRoutes);
  router.use("/profesores", profesorRoutes);
}
