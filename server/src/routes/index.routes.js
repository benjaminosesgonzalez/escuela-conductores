import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import planRoutes from "./plan.routes.js";
import alumnoRoutes from "./alumno.routes.js";
import sedeRoutes from "./sede.routes.js";
import profesorRoutes from "./profesor.routes.js";
import secretariaRoutes from "./secretaria.routes.js";
import autoRoutes from "./auto.routes.js";
import solicitudAutoRoutes from "./solicitudAuto.routes.js";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/auth", authRoutes);
  router.use("/profile", profileRoutes);
  router.use("/autos", autoRoutes);
  router.use("/plans", planRoutes);
  router.use("/alumnos", alumnoRoutes);
  router.use("/sedes", sedeRoutes);
  router.use("/profesores", profesorRoutes);
  router.use("/secretarias", secretariaRoutes);
  router.use("/solicitudes-auto", solicitudAutoRoutes);
}
