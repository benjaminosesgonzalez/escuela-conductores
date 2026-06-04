import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import planRoutes from "./plan.routes.js";
import alumnoRoutes from "./alumno.routes.js";
//import sedeRoutes from "./sede.routes.js";
import { authMiddleware, isAdminOrSecretaria } from "../middleware/auth.middleware.js";
import agendamientoRoutes from "./agendamiento.routes.js";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/auth", authRoutes);
  router.use("/profile", profileRoutes);
  router.use("/plans", planRoutes);
  router.use("/alumnos", alumnoRoutes);
  //router.use("/sedes", sedeRoutes);
  router.use("/psicotecnica", agendamientoRoutes);
}
