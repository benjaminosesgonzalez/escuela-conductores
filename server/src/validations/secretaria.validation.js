import { z } from 'zod';

export const paramsIdSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive("El id debe ser un número positivo."),
    }),
});

export const updateSecretariaSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive(),
    }),
    body: z.object({
        nombre: z.string().min(4).optional(),
        telefono: z.string().min(9).optional(),
    }).strict(),
});

// Validación para asignación masiva de alumnos (Checkboxes)
export const asignarSedeMasivaIdsSchema = z.object({
  body: z.object({
    alumnos_ids: z.array(z.number().int().positive(), {
      required_error: "El arreglo alumnos_ids es requerido.",
      invalid_type_error: "El arreglo alumnos_ids debe contener números válidos.", 
    }).min(1, "Debe seleccionar al menos un alumno."),
    id_sede: z.number({
        required_error: "El id_sede es requerido.",
    }).int().positive("El id_sede debe ser un número válido.")
  }).strict(), //bloquea cualquier otro dato basura que envie el front
});

// Validación para asignación masiva de profesores (Checkboxes)
export const asignarSedeMasivaProfesoresSchema = z.object({
  body: z.object({
    profesores_ids: z.array(z.number().int().positive(), {
      required_error: "El arreglo profesores_ids es requerido.",
      invalid_type_error: "El arreglo profesores_ids debe contener números válidos.", 
    }).min(1, "Debe seleccionar al menos un profesor."),
    //aqui recibimos el arreglo de sedes pq puede tener mas de una
    sedes_ids: z.array(z.number().int().positive(), {
        required_error: "Debe proporcionar un arreglo de sedes_ids.",
    }).min(1, "Debe seleccionar al menos una sede."),
  }).strict(), //bloquea cualquier otro dato basura que envie el front
});


export const asignarSedeAlumnoSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    id_sede: z.number({
      required_error: "Debe proporcionar el id_sede",
      invalid_type_error: "El id_sede debe ser un número",
    }).int().positive(),
  }),
});

export const asignarSedesProfesorSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    sedes_ids: z.array(z.number().int().positive(), {
      required_error: "Debe proporcionar un array de sedes_ids",
    }).min(1, "El array de sedes no puede estar vacío"),
  }),
});