"use strict";
import { Router } from "express";
import {
  elegirPlanPreferencia,
  oficializarMatricula,
  matricularNuevoAlumno,
  editarAlumno,
  autoRegistroAlumno,
  asignarSedeMasiva,
  getAlumnos,
  resetPasswordAlumno,
  eliminarAlumnosMasivo,
  obtenerPlanAlumno,
  obtenerClasesProximas,
  obtenerEstadisticasAlumno,
  obtenerAvanceTemas,
  obtenerAvanceClasesPracticas,
} from "../controllers/alumno.controller.js";
//import { obtenerEstadoMatriculaService } from "../services/alumno.service.js";
import {authMiddleware, isAdmin, isAdminOrSecretaria} from "../middleware/auth.middleware.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { asignarSedeMasivaAlumnos } from "../controllers/secretaria.controller.js";
import { asignarSedeMasivaIdsSchema } from "../validations/secretaria.validation.js";
import {
  registroAlumnoSchema,
  editarAlumnoSchema,
} from "../validations/alumno.validation.js";

const router = Router();

// Matricular nuevo alumno (solo secretaria/admin)
// POST /api/alumnos/registro/nuevo
  
router.put("/:id", editarAlumno);
router.post(
  "/registro/nuevo",
  authMiddleware,
  isAdminOrSecretaria,
  validateSchema(registroAlumnoSchema),
  matricularNuevoAlumno,
);
// Obtener todos los alumnos
// GET /api/alumnos
router.get("/", authMiddleware, isAdminOrSecretaria, getAlumnos);

// Obtener plan del alumno
// GET /api/alumnos/:id/plan
router.get("/:id/plan", authMiddleware, obtenerPlanAlumno);

// Obtener clases próximas del alumno
// GET /api/alumno/:alumnoId/clases-proximas
router.get("/:alumnoId/clases-proximas", authMiddleware, obtenerClasesProximas);

// Obtener estadísticas del alumno
// GET /api/alumnos/:alumnoId/estadisticas
router.get("/:alumnoId/estadisticas", authMiddleware, obtenerEstadisticasAlumno);

// Obtener avance de temas teóricos
// GET /api/alumnos/:alumnoId/avance-temas
router.get("/:alumnoId/avance-temas", authMiddleware, obtenerAvanceTemas);

// Obtener avance de clases prácticas
// GET /api/alumnos/:alumnoId/avance-practicas
router.get("/:alumnoId/avance-practicas", authMiddleware, obtenerAvanceClasesPracticas);
// Auto-registro de alumno (sin autenticación)
// POST /api/alumnos/registro/auto
router.post(
  "/registro/auto",
  validateSchema(registroAlumnoSchema),
  autoRegistroAlumno,
  authMiddleware, 
  isAdminOrSecretaria
);

router.delete(
  "/eliminar",
  authMiddleware,
  isAdminOrSecretaria,
  eliminarAlumnosMasivo,
);

// El alumno elige su preferencia
// POST /api/alumnos/preferencia
router.post("/preferencia", authMiddleware, elegirPlanPreferencia);

// POST /api/alumnos/matricular
router.post("/matricular", authMiddleware, oficializarMatricula);

//ruta para asignar sedes masivamente a alumnos POST /api/alumnos/sede-alumno
router.put(
  "/sede-alumno",
  authMiddleware,
  validateSchema(asignarSedeMasivaIdsSchema),
  asignarSedeMasivaAlumnos,
);

// Editar alumno
// PUT /api/alumnos/:id
router.put(
  "/:id",
  authMiddleware,
  isAdminOrSecretaria,
  validateSchema(editarAlumnoSchema),
  editarAlumno,
);
// Agrega esta línea junto a tus otras rutas PUT
router.put(
  "/reset-password/:id",
  authMiddleware,
  isAdminOrSecretaria,
  resetPasswordAlumno,
);

export default router;
