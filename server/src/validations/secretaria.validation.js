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

export const registroSecretariaSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "El email es obligatorio." }).email("Debe ser un correo electrónico válido."),
    password: z.string({ required_error: "La contraseña es obligatoria." }).min(6, "La contraseña debe tener al menos 6 caracteres."),
    nombre: z.string({ required_error: "El nombre es obligatorio." }).min(3, "El nombre debe tener al menos 3 letras."),
    telefono: z.string().min(8, "El teléfono debe tener al menos 8 dígitos numéricos.").optional().nullable(),
  })
});
