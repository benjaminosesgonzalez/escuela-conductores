import { AppDataSource } from "../config/configDb.js";

const CRITERIOS_PREDEFINIDOS = [
  // Tipo BAJA (-0.5)
  {
    nombre: "Error de manipulación técnica del pedal de embrague",
    tipo_falta: "baja",
    puntaje_descuento: 0.5,
    orden: 1,
  },
  {
    nombre: "No mantener postura correcta al volante",
    tipo_falta: "baja",
    puntaje_descuento: 0.5,
    orden: 2,
  },
  {
    nombre: "No ajustar espejos correctamente antes de iniciar",
    tipo_falta: "baja",
    puntaje_descuento: 0.5,
    orden: 3,
  },

  // Tipo MEDIA (-1.0)
  {
    nombre: "Incumplimiento de normativas de tránsito",
    tipo_falta: "media",
    puntaje_descuento: 1.0,
    orden: 4,
  },
  {
    nombre: "No mantener velocidad adecuada",
    tipo_falta: "media",
    puntaje_descuento: 1.0,
    orden: 5,
  },
  {
    nombre: "Frenado deficiente o brusco",
    tipo_falta: "media",
    puntaje_descuento: 1.0,
    orden: 6,
  },
  {
    nombre: "Cambios de carril sin señalizar",
    tipo_falta: "media",
    puntaje_descuento: 1.0,
    orden: 7,
  },

  // Tipo ALTA (-2.0)
  {
    nombre: "Circular en contrasentido del tráfico",
    tipo_falta: "alta",
    puntaje_descuento: 2.0,
    orden: 8,
  },
  {
    nombre: "Exceso de velocidad grave (más de 20 km/h sobre límite)",
    tipo_falta: "alta",
    puntaje_descuento: 2.0,
    orden: 9,
  },
  {
    nombre: "Colisión o riesgo inminente de accidente",
    tipo_falta: "alta",
    puntaje_descuento: 2.0,
    orden: 10,
  },
];

export const seedCriteriosEvaluacion = async () => {
  try {
    const criterioRepository = AppDataSource.getRepository("CriterioEvaluacionPractica");

    const existentes = await criterioRepository.find();

    if (existentes.length > 0) {
      console.log("✓ Criterios de evaluación ya existen en la BD");
      return;
    }

    console.log("=> Creando criterios de evaluación práctica...");

    for (const criterio of CRITERIOS_PREDEFINIDOS) {
      await criterioRepository.save({
        nombre: criterio.nombre,
        tipo_falta: criterio.tipo_falta,
        puntaje_descuento: criterio.puntaje_descuento,
        orden: criterio.orden,
        activo: true,
      });
    }

    console.log("=> 10 criterios de evaluación creados exitosamente");
  } catch (error) {
    console.error("Error en seedCriteriosEvaluacion:", error);
    throw error;
  }
};
