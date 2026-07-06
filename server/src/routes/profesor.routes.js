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
import { asignarSedeMasivaProfesores } from "../controllers/secretaria.controller.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { asignarSedeMasivaProfesoresSchema } from "../validations/secretaria.validation.js";

const router = Router();

router.use(authMiddleware, isAdminOrSecretaria);

router.get("/", getProfesores);
router.put("/:id", updateProfesor);
router.delete("/:id", deleteProfesor);

//asignar sedes a profesores (admin o secretaria) POST /api/profesores/sedes
router.put("/sedes-profesor", authMiddleware, isAdminOrSecretaria, validateSchema(asignarSedeMasivaProfesoresSchema), asignarSedeMasivaProfesores);


export default router;
