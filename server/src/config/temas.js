export const TEMAS_CLASES = [
  {
    numero: 1,
    nombre: "Señalización y Leyes de Tránsito",
  },
  {
    numero: 2,
    nombre: "Límites de Velocidad y Distancias",
  },
  {
    numero: 3,
    nombre: "Seguridad Vial Crítica y Sustancias",
  },
  {
    numero: 4,
    nombre: "Mecánica Básica y Funcionamiento",
  },
  {
    numero: 5,
    nombre: "Conducción en Condiciones Adversas",
  },
  {
    numero: 6,
    nombre: "Conducción Eficiente",
  },
  {
    numero: 7,
    nombre: "Siniestros y Sistema Seguro",
  },
  {
    numero: 8,
    nombre: "Psicología del Conductor y Atención",
  },
  {
    numero: 9,
    nombre: "Elementos de Seguridad Activa y Pasiva",
  },
  {
    numero: 10,
    nombre: "Convivencia Vial y Educación Vial",
  },
];

export const obtenerTemaPorDia = (numeroSemana, diaSemana) => {
  const diasLaboral = ["lunes", "martes", "miércoles", "jueves", "viernes"];
  const indiceDia = diasLaboral.indexOf(diaSemana.toLowerCase());

  if (indiceDia === -1) return null;

  // Cada semana tiene 5 días, en 2 semanas tenemos 10 temas
  // Semana 0: temas 1-5
  // Semana 1: temas 6-10
  const numeroTema = numeroSemana * 5 + indiceDia + 1;

  if (numeroTema > 10) return null;

  return TEMAS_CLASES.find(t => t.numero === numeroTema);
};
