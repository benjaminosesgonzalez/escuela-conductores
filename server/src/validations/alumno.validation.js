import { z } from 'zod';

// Regex para RUT chileno (7 u 8 dígitos, un guión y un dígito o K)
const rutRegex = /^[0-9]{7,8}-[0-9Kk]{1}$/;

export const registroAlumnoSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "El email es obligatorio." }).email("Debe ser un correo electrónico válido (ej: usuario@correo.com)."),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").optional(), // Opcional porque en secretaria se genera sola
    nombre: z.string({ required_error: "El nombre es obligatorio." }).min(3, "El nombre debe tener al menos 3 letras."),
    rut: z.string({ required_error: "El RUT es obligatorio." }).regex(rutRegex, "El RUT debe tener el formato válido sin puntos y con guión (ej: 12345678-9)."),
    telefono: z.string().min(8, "El teléfono debe tener al menos 8 dígitos numéricos.").optional().nullable(),
    sexo: z.string().optional().nullable(),
    comuna: z.string().min(3, "La comuna debe tener al menos 3 letras.").optional().nullable(),
    id_plan_matriculado: z.number().int().positive().optional().nullable(),
    id_plan_interes: z.number().int().positive().optional().nullable(),
    sede: z.number().int().positive().optional().nullable(),
  })
});

export const editarAlumnoSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("El ID del alumno debe ser un número positivo."),
  }),
  body: z.object({
    email: z.string().email("Debe ser un correo electrónico válido.").optional(),
    nombre: z.string().min(3, "El nombre debe tener al menos 3 letras.").optional(),
    telefono: z.string().min(8, "El teléfono debe tener al menos 8 dígitos.").optional().nullable(),
    sexo: z.string().optional().nullable(),
    comuna: z.string().optional().nullable(),
  })
});