# Guía de Prueba - Agendamiento de Clases (Secretaria)

## Resumen de Implementación

Se ha implementado un sistema completo de agendamiento de clases desde la vista de la secretaria. Los alumnos pueden solicitar clases y la secretaria puede asignarlas a profesores disponibles.

## Archivos Creados/Modificados

### Backend
- `server/src/entities/clase.entity.js` - Entidad para almacenar clases agendadas
- `server/src/services/clase.service.js` - Servicios de negocio para clases
- `server/src/controllers/clase.controller.js` - Controladores para endpoints de clases
- `server/src/routes/clase.routes.js` - Rutas de API para clases
- `server/src/routes/index.routes.js` - Agregadas rutas de clases

### Frontend
- `client/src/pages/secretaria/AgendarClasesSecretaria.jsx` - Vista principal de agendamiento
- `client/src/pages/alumno/MisClasesAlumno.jsx` - Vista de clases agendadas del alumno
- `client/src/pages/secretaria/DashboardSecretaria.jsx` - Agregado tab "Agendar clases"
- `client/src/pages/alumno/DashboardAlumno.jsx` - Agregado tab "Mis clases"
- `client/src/layouts/SecretariaLayout.jsx` - Agregado botón "Agendar clases" en sidebar

## Flujo de Uso

### 1. Alumno Reserva Disponibilidad
1. Alumno ingresa a http://localhost:5173 
2. Login con credenciales de alumno
3. Va a "Reservar clase"
4. Selecciona hasta el máximo de clases permitidas por su plan
5. Las selecciones se guardan automáticamente

### 2. Secretaria Agenda Clase
1. Secretaria ingresa a http://localhost:5173
2. Login con credenciales de secretaria
3. Va a "Agendar clases" en sidebar
4. Verá lista de alumnos con disponibilidades seleccionadas (disponible: true)
5. Haz clic en una disponibilidad de alumno
6. Se mostrarán profesores disponibles en ese horario
7. Selecciona un profesor
8. Haz clic en "Confirmar Clase"
9. La clase se crea y la disponibilidad del alumno se marca como false

### 3. Alumno Ve Clases Agendadas
1. Alumno va a "Mis clases" en su dashboard
2. Verá todas las clases que la secretaria ha agendado para él
3. Mostrará: día, hora, profesor asignado y estado

## Endpoints API Creados

```
GET    /api/clases/alumnos-para-agendar       - Obtener alumnos con disponibilidades
GET    /api/clases/profesores-disponibles      - Obtener profesores disponibles por horario
GET    /api/clases/:alumnoId                   - Obtener clases de un alumno
POST   /api/clases                             - Crear nueva clase
```

## Parámetros de Consulta

### GET /api/clases/profesores-disponibles
```
dia: string       (ej: "lunes")
horaInicio: string (ej: "09:00")
horaFin: string   (ej: "09:45")
```

### POST /api/clases
```json
{
  "alumnoId": number,
  "profesorId": number,
  "diaSemana": string,
  "horaInicio": string,
  "horaFin": string
}
```

## Credenciales de Prueba

### Alumno
- Email: `alumno@test.com` o un alumno existente
- Contraseña: tu_contraseña

### Profesor  
- Email: profesor existente o `profesor@test.com`
- Contraseña: tu_contraseña

### Secretaria
- Email: `secretaria@test.com` o una secretaria existente
- Contraseña: tu_contraseña

## Validaciones Implementadas

✅ Solo se muestran alumnos con disponibilidades = true
✅ Solo se muestran profesores con disponible = true en ese horario
✅ Después de agendar, la disponibilidad del alumno se marca como false
✅ Las clases se guardan en tabla `clases`
✅ Las clases aparecen en "Mis clases" del alumno

## Estructura de Datos

### Tabla clases
```
id: int
alumnoId: int (FK)
profesorId: int (FK)
diaSemana: varchar
horaInicio: varchar
horaFin: varchar
estado: varchar (confirmada, completada, cancelada)
createdAt: timestamp
updatedAt: timestamp
```

## Próximos Pasos Opcionales

1. Mostrar estadísticas de clases agendadas en secretaria
2. Cancelar clases desde vista de alumno
3. Reagendar clases
4. Notificaciones a profesor cuando se asigna clase
5. Historial de clases completadas
