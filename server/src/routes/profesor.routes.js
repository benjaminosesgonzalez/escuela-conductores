import { Router } from "express";
import {
  getProfesores,
  updateProfesor,
  deleteProfesor,
} from "../controllers/profesor.controller.js";
import {
  authMiddleware,
  isAdminOrSecretaria,
} from "../middleware/auth.middleware.js";
import { asignarSedesProfesor } from "../controllers/secretaria.controller.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { asignarSedesProfesorSchema } from "../validations/secretaria.validation.js";

const router = Router();

router.use(authMiddleware, isAdminOrSecretaria);

router.get("/", getProfesores);
router.put("/:id", updateProfesor);
router.delete("/:id", deleteProfesor);

//asignar sedes a un profesor (admin o secretaria) PUT /api/profesores/:id/sedes
router.put("/:id/sedes", authMiddleware, isAdminOrSecretaria, validateSchema(asignarSedesProfesorSchema), asignarSedesProfesor);

export default router;
