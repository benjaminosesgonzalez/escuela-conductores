import { Router } from "express";
import {
  registrarProfesor,
  getProfesores,
  updateProfesor,
  deleteProfesor,
  eliminarProfesoresMasivo,
  resetPasswordProfesor,
  obtenerAlumnosInscritos,
  obtenerClasesHoy,
  obtenerVehiculosReservados,
  obtenerClasesDetalleHoy
} from "../controllers/profesor.controller.js";
import {
  authMiddleware,
  isAdmin,
  isAdminOrSecretaria,
} from "../middleware/auth.middleware.js";
import { asignarSedeMasivaProfesores } from "../controllers/secretaria.controller.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { asignarSedeMasivaProfesoresSchema } from "../validations/secretaria.validation.js";

const router = Router();

// Registro de profesor (solo admin autorizado)
router.post("/registro", authMiddleware, isAdmin, registrarProfesor);

// Rutas de estadísticas (protegidas por auth)
router.get("/:profesorId/alumnos-inscritos", authMiddleware, obtenerAlumnosInscritos);
router.get("/:profesorId/clases-hoy", authMiddleware, obtenerClasesHoy);
router.get("/:profesorId/clases-detalle-hoy", authMiddleware, obtenerClasesDetalleHoy);
router.get("/:profesorId/vehiculos-reservados", authMiddleware, obtenerVehiculosReservados);

// Resto de rutas protegidas: admin o secretaria
router.use(authMiddleware, isAdminOrSecretaria);
router.delete("/eliminar", authMiddleware, isAdminOrSecretaria, eliminarProfesoresMasivo);
router.get("/", getProfesores);
//asignar sedes a profesores (admin o secretaria) POST /api/profesores/sedes
router.put("/sedes-profesor", authMiddleware, isAdminOrSecretaria, validateSchema(asignarSedeMasivaProfesoresSchema), asignarSedeMasivaProfesores);

router.put("/reset-password/:id", authMiddleware, isAdminOrSecretaria, resetPasswordProfesor);
router.put("/:id", updateProfesor);
router.delete("/:id", deleteProfesor);

export default router;
