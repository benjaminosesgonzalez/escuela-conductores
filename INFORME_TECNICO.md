# INFORME TÉCNICO FINAL
## Sistema de Gestión de Escuela de Conductores

**Proyecto Semestral ISW 2026-1**  
**Ingeniería de Software II**  
Semestre: Primer Semestre 2026

---

## TABLA DE CONTENIDOS

1. [Introducción](#capítulo-i-introducción)
2. [Requerimientos de Software](#capítulo-ii-requerimientos-de-software)
3. [Análisis y Diseño](#capítulo-iii-análisis-y-diseño)
4. [Desarrollo](#capítulo-iv-desarrollo)
5. [Conclusiones](#capítulo-v-conclusiones)
6. [Bibliografía](#capítulo-vi-bibliografía)

---

# CAPÍTULO I: INTRODUCCIÓN

## I.1. Presentación del Contexto y Problemática

### I.1.1. Presentación de la Institución/Empresa

La **Escuela de Conductores** es una institución educativa especializada en la formación integral de conductores. Ofrece programas de capacitación teórica y práctica para obtener licencia de conducción en categorías A, B, C y superiores. La escuela opera en múltiples sedes físicas (Concepción, San Pedro de la Paz, Chiguayante, entre otras) y cuenta con un equipo multidisciplinario compuesto por:

- **Profesores/Instructores**: Encargados de impartir clases teóricas y prácticas
- **Personal Secretarial**: Responsable de la administración, matriculación e inscripciones
- **Personal Administrativo**: Gestión de sedes, vehículos y recursos
- **Alumnos/Estudiantes**: Diversos perfiles de edad y experiencia

### I.1.2. Descripción de Problemas y Oportunidades de Mejora

#### Problemas Identificados

1. **Gestión Desorganizada de Horarios**: 
   - Falta de sistema centralizado para disponibilidad de profesores
   - Conflictos de horarios en reservas de clases prácticas
   - Dificultad en la coordinación entre múltiples sedes

2. **Control Ineficiente de Vehículos**:
   - Sin registro actualizado del stock y disponibilidad de autos
   - Proceso manual para solicitud y asignación de vehículos
   - Ausencia de historial de mantenimiento y uso

3. **Falta de Seguimiento Académico**:
   - Sin visibilidad clara del progreso del alumno
   - Registros manuales de evaluaciones y calificaciones
   - Dificultad para acceder a material educativo

4. **Procesos Administrativos Obsoletos**:
   - Inscripción y matriculación completamente manual
   - Inexistencia de plataforma digital para pagos y trámites
   - Generación inadecuada de horarios de exámenes psicotécnicos

5. **Falta de Comunicación Integrada**:
   - Sin canal centralizado de información entre actores
   - Dispersión de datos en múltiples sistemas

#### Oportunidades de Mejora

- Automatización de procesos administrativos
- Centralización de información en una plataforma web
- Mejora de experiencia de usuario (alumnos, profesores, administrativos)
- Incremento de eficiencia operativa
- Reducción de costos administrativos
- Mejora en trazabilidad y reportería

## I.2. Propuesta de Solución

Se propone desarrollar un **Sistema Web Integral de Gestión de Escuela de Conductores** que integre:

- **Módulo de Gestión Académica**: Administración de clases teóricas y prácticas
- **Módulo de Profesores**: Gestión de disponibilidad, material educativo y evaluaciones
- **Módulo de Alumnos**: Seguimiento de progreso, reserva de clases y solicitud de vehículos
- **Módulo de Secretaría**: Matriculación, gestión de planes y configuración de horarios
- **Módulo de Vehículos**: Control de inventario y asignación de autos
- **Módulo de Sedes**: Administración de ubicaciones físicas y recursos

La solución será una **plataforma web moderna** desarrollada con:
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express + TypeORM
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT con encriptación bcrypt

## I.3. Composición del Informe

Este informe técnico se estructura en los siguientes capítulos:

| Capítulo | Contenido |
|----------|-----------|
| **I. Introducción** | Contexto, problemática y propuesta de solución |
| **II. Requerimientos** | Objetivos, requisitos funcionales y no funcionales |
| **III. Análisis y Diseño** | Modelos de datos, casos de uso, interfaces |
| **IV. Desarrollo** | Arquitectura, stack tecnológico, estructura de código |
| **V. Conclusiones** | Logros, impacto y recomendaciones futuras |
| **VI. Bibliografía** | Referencias técnicas y fuentes de investigación |

---

# CAPÍTULO II: REQUERIMIENTOS DE SOFTWARE

## II.1. Objetivo General del Software

Desarrollar una plataforma web integral que automatice y centralice los procesos administrativos, académicos y operativos de una escuela de conductores, mejorando la eficiencia, transparencia y experiencia de todos los actores del sistema.

## II.2. Objetivos Específicos

1. **Automatizar la gestión de inscripción y matriculación** de alumnos con asignación de planes de conducción
2. **Facilitar el seguimiento académico** de alumnos en tiempo real (clases teóricas y prácticas)
3. **Optimizar la disponibilidad de profesores** mediante gestión centralizada de horarios y bloques
4. **Administrar el inventario de vehículos** y su asignación para exámenes municipales
5. **Gestionar el calendario de exámenes psicotécnicos** con disponibilidad de bloques horarios
6. **Centralizar repositorio de material educativo** (clases, documentos, guías)
7. **Implementar evaluaciones digitales** para cursos prácticos con registro de desempeño
8. **Generar reportes automáticos** de progreso académico y desempeño

## II.3. Requerimientos Funcionales del Software

### RF.1 - GESTIÓN DE PROFESORES

#### RF.1.1 Cargar Material Educativo
- El profesor debe poder subir clases grabadas en formato de video
- Carga de documentos técnicos basados en "Libro del Nuevo Conductor"
- Organización de material por curso/módulo
- Descarga de material por alumnos

#### RF.1.2 Evaluar Cursos Prácticos
- Acceso a instrumento de evaluación digital
- Clasificación de tipos de faltas (graves, leves, etc.)
- Registro de desempeño del alumno
- Generación automática de reportes de evaluación

#### RF.1.3 Gestionar Disponibilidad de Horarios
- Seleccionar disponibilidad semanal en bloques
- Definir horarios accesibles para impartir clases
- Modificación de disponibilidad según necesidad
- Visualización de conflictos de horarios

### RF.2 - GESTIÓN DE ALUMNOS

#### RF.2.1 Seleccionar e Inscribirse en Planes
- Visualización de planes disponibles (Básico, Extensión, Intensivo)
- Selección de plan durante inscripción
- Habilitación de opciones de pago tras selección
- Matriculación automática tras confirmación de pago

#### RF.2.2 Monitoreo de Progreso Académico
- Visualización de dashboard con progreso general
- Seguimiento de clases teóricas completadas
- Seguimiento de clases prácticas completadas
- Visualización de calificaciones y evaluaciones
- Acceso a material educativo del plan

#### RF.2.3 Solicitud de Vehículos para Examen Municipal
- Disponibilidad de opción tras completar todas las clases
- Levantamiento de solicitud de vehículo
- Visualización de estado de solicitud
- Confirmación de vehículo asignado

### RF.3 - GESTIÓN DE SECRETARÍA

#### RF.3.1 Registrar y Matricular Alumnos
- Formulario de inscripción con validación de datos personales
- Asociación automática a plan de conducción (Básico, Extensión, Intensivo)
- Generación de registro de alumno en sistema
- Historial de matriculación

#### RF.3.2 Asignar Sedes a Actores
- Asignación de sucursal física (Concepción, San Pedro de la Paz, Chiguayante, etc.)
- Asignación a alumnos y profesores al momento del registro
- Posibilidad de cambio de sede cuando sea requerido
- Asociación de recursos a sedes

#### RF.3.3 Configurar Disponibilidad de Exámenes Psicotécnicos
- Calendarios interactivos por sede
- División de días en bloques de 15 minutos
- Apertura/cierre de disponibilidad semanal
- Gestión de cierres por feriados o mantenimiento
- Visualización de ocupación de bloques

#### RF.3.4 Administrar Stock de Vehículos
- Registro de vehículos (marca, modelo, placa, año)
- Gestión de disponibilidad de autos
- Asignación según peticiones de alumnos
- Historial de uso y mantenimiento
- Actualización de flota

### RF.4 - GENERACIÓN AUTOMÁTICA DE CLASES

#### RF.4.1 Generación Semanal de Bloques de Disponibilidad
- Scheduler automático que genera bloques semanales
- Consideración de disponibilidades de profesores
- Generación de clases disponibles para alumnos
- Regeneración periódica (semanal)

#### RF.4.2 Generación de Clases Online
- Creación automática de clases online según plan
- Asignación a profesores disponibles
- Disponibilidad para inscripción de alumnos
- Sincronización con calendarios

### RF.5 - AUTENTICACIÓN Y AUTORIZACIÓN

#### RF.5.1 Sistema de Autenticación
- Registro de usuarios con rol asignado
- Autenticación mediante JWT
- Encriptación de contraseñas con bcrypt
- Sesiones seguras

#### RF.5.2 Control de Acceso por Rol
- Profesor: Acceso a funciones de docencia
- Alumno: Acceso a funciones académicas
- Secretaria: Acceso a funciones administrativas
- Administrador: Acceso completo al sistema

---

## II.4. Límites del Sistema

| Límite | Descripción |
|--------|-------------|
| **Sedes** | Sistema soporta máximo 10 sedes físicas |
| **Alumnos Concurrentes** | Máximo 500 alumnos activos por semestre |
| **Profesores** | Máximo 50 profesores por sede |
| **Vehículos** | Máximo 100 vehículos por escuela |
| **Bloques Disponibilidad** | 96 bloques de 15 min por día (00:00-24:00) |
| **Tamaño Material** | Máximo 500 MB por archivo multimedia |
| **Usuarios Concurrentes** | Máximo 100 conexiones simultáneas |
| **Almacenamiento** | No se especifica límite en fase inicial |

## II.5. Requerimientos No Funcionales del Software

### RNF.1 - RENDIMIENTO
- Tiempo de respuesta < 2 segundos para consultas
- Carga de páginas < 3 segundos
- Soportar 100 usuarios concurrentes
- Procesamiento de imágenes y videos optimizado

### RNF.2 - SEGURIDAD
- Autenticación mediante JWT
- Encriptación de contraseñas con bcrypt
- Validación de entrada en todos los formularios
- Protección contra inyección SQL (TypeORM)
- CORS configurado correctamente
- Encriptación de datos sensibles

### RNF.3 - CONFIABILIDAD
- Disponibilidad del sistema 99% (excepto mantenimiento)
- Backup diarios de base de datos
- Recuperación ante fallos
- Logging de errores centralizado
- Monitoreo de salud del sistema

### RNF.4 - MANTENIBILIDAD
- Código modular y bien estructurado
- Documentación de APIs completa
- Comentarios en código para lógica compleja
- Estructura clara de carpetas
- Versionamiento de código con Git

### RNF.5 - USABILIDAD
- Interfaz intuitiva y consistente
- Navegación clara con migas de pan
- Mensajes de error amigables
- Validaciones en tiempo real
- Feedback visual de acciones
- Responsivo (desktop, tablet, mobile)

### RNF.6 - ESCALABILIDAD
- Arquitectura modular para crecimiento
- Base de datos normalizada
- Capacidad de agregar nuevas sedes
- Posibilidad de integración con sistemas externos

---

## II.6. Interfaces Externas de Entrada

| Interfaz | Descripción | Formato |
|----------|-------------|---------|
| **Formulario Registro Alumno** | Datos personales, contacto, plan seleccionado | JSON (formulario web) |
| **Carga de Material Educativo** | Archivos multimedia (videos, PDFs, documentos) | Multipart/form-data |
| **Disponibilidad Profesor** | Selección de bloques horarios semanales | JSON (configuración) |
| **Solicitud Vehículo** | Datos de alumno, fechas, tipo de examen | JSON (formulario web) |
| **Configuración Psicotécnico** | Bloques disponibles, cierres, horarios | JSON (calendario) |
| **Evaluación Práctica** | Registro de faltas, desempeño, observaciones | JSON (formulario) |
| **Modificación Disponibilidad Clase** | Cambios en horarios, cancelaciones | JSON (PATCH request) |

---

## II.7. Interfaces Externas de Salida

| Interfaz | Descripción | Formato |
|----------|-------------|---------|
| **Dashboard Alumno** | Progreso académico, clases disponibles, evaluaciones | HTML/JSON (web) |
| **Dashboard Profesor** | Clases agendadas, alumnos inscritos, evaluaciones | HTML/JSON (web) |
| **Dashboard Secretaria** | Matrículas, configuración, gestión de recursos | HTML/JSON (web) |
| **Reportes de Progreso** | PDF con historial académico del alumno | PDF descargable |
| **Confirmación de Matriculación** | Email con datos de inscripción | Email (SMTP) |
| **Notificación de Cambios** | Cambios en horarios, disponibilidad | In-app notification |
| **Listado de Clases Disponibles** | Horarios, profesores, sedes | JSON/HTML tabla |
| **Reporte Evaluaciones** | Calificaciones y desempeño del alumno | PDF/Excel |

---

# CAPÍTULO III: ANÁLISIS Y DISEÑO

## III.1. Modelo de Datos

### III.1.1 Diagrama Entidad-Relación (DER)

```
[CAPTURA DE PANTALLA: Diagrama Entidad-Relación completo]
```

**Descripción de Entidades Principales:**

#### Usuarios (User)
- **Atributos**: id, email, password_hash, tipo_usuario, activo, fecha_registro
- **Relaciones**: 1 a 1 con Alumno/Profesor/Secretaria (polimórfico)

#### Alumno
- **Atributos**: id, user_id, nombre, apellido, rut, telefono, fecha_nacimiento, sede_id, estado
- **Relaciones**: 
  - N a 1 con Usuario (user_id)
  - N a 1 con Sede (sede_id)
  - N a 1 con Plan (plan_id)
  - N a N con Clase (inscripción)
  - N a N con ClaseOnline
  - 1 a N con DisponibilidadAlumno
  - 1 a N con SolicitudAuto

#### Profesor
- **Atributos**: id, user_id, nombre, apellido, rut, telefono, especialidad, sede_id, activo
- **Relaciones**:
  - N a 1 con Usuario (user_id)
  - N a 1 con Sede (sede_id)
  - 1 a N con Disponibilidad
  - 1 a N con Clase
  - 1 a N con ClaseOnline
  - 1 a N con ClaseOnlineAlumno (evaluador)

#### Secretaria
- **Atributos**: id, user_id, nombre, apellido, rut, telefono, sede_id, activo
- **Relaciones**:
  - N a 1 con Usuario (user_id)
  - N a 1 con Sede (sede_id)

#### Sede
- **Atributos**: id, nombre, direccion, ciudad, telefono, activo
- **Relaciones**:
  - 1 a N con Alumno
  - 1 a N con Profesor
  - 1 a N con Secretaria
  - 1 a N con HorarioPsicotecnico
  - 1 a N con Auto

#### Plan
- **Atributos**: id, nombre (Básico/Extensión/Intensivo), descripcion, precio, duracion_semanas, estado
- **Relaciones**:
  - 1 a N con Alumno
  - 1 a N con Clase
  - 1 a N con ClaseOnline

#### Clase
- **Atributos**: id, plan_id, profesor_id, sede_id, tipo (teórica/práctica), fecha, hora_inicio, hora_fin, capacidad, estado
- **Relaciones**:
  - N a 1 con Plan (plan_id)
  - N a 1 con Profesor (profesor_id)
  - N a 1 con Sede (sede_id)
  - N a N con Alumno (inscripción)

#### Disponibilidad
- **Atributos**: id, profesor_id, dia_semana, hora_inicio, hora_fin, activo
- **Relaciones**:
  - N a 1 con Profesor (profesor_id)

#### ClaseOnline
- **Atributos**: id, plan_id, profesor_id, titulo, descripcion, fecha_grabacion, url_video, estado
- **Relaciones**:
  - N a 1 con Plan (plan_id)
  - N a 1 con Profesor (profesor_id)
  - 1 a N con ClaseOnlineAlumno

#### ClaseOnlineAlumno
- **Atributos**: id, clase_online_id, alumno_id, fecha_inscripcion, visto, fecha_visto, calificacion
- **Relaciones**:
  - N a 1 con ClaseOnline
  - N a 1 con Alumno

#### Auto
- **Atributos**: id, sede_id, marca, modelo, placa, año, tipo_transmision, estado, fecha_registro
- **Relaciones**:
  - N a 1 con Sede (sede_id)
  - 1 a N con SolicitudAuto

#### SolicitudAuto
- **Atributos**: id, alumno_id, auto_id, fecha_solicitud, estado, fecha_asignacion, observaciones
- **Relaciones**:
  - N a 1 con Alumno
  - N a 1 con Auto

#### HorarioPsicotecnico
- **Atributos**: id, sede_id, fecha, hora_inicio, hora_fin, capacidad, ocupado, estado
- **Relaciones**:
  - N a 1 con Sede
  - 1 a 1 con ReservaPsicotecnico

#### ReservaPsicotecnico
- **Atributos**: id, horario_id, alumno_id, fecha_reserva, estado, observaciones
- **Relaciones**:
  - 1 a 1 con HorarioPsicotecnico
  - N a 1 con Alumno

---

### III.1.2 Modelo Relacional (Normalizado)

```
[CAPTURA DE PANTALLA: Modelo relacional en 3FN]
```

**Tabla: users**
```sql
- id (PK)
- email (UNIQUE)
- password_hash
- tipo_usuario (ENUM: alumno, profesor, secretaria, admin)
- activo (BOOLEAN)
- fecha_registro (TIMESTAMP)
```

**Tabla: alumnos**
```sql
- id (PK)
- user_id (FK → users)
- nombre, apellido, rut (UNIQUE), telefono
- fecha_nacimiento
- sede_id (FK → sedes)
- plan_id (FK → planes)
- estado (ENUM: activo, inactivo, completado)
- fecha_inscripcion (TIMESTAMP)
```

**Tabla: profesores**
```sql
- id (PK)
- user_id (FK → users)
- nombre, apellido, rut (UNIQUE), telefono
- especialidad
- sede_id (FK → sedes)
- activo (BOOLEAN)
- fecha_registro (TIMESTAMP)
```

**Tabla: secretarias**
```sql
- id (PK)
- user_id (FK → users)
- nombre, apellido, rut (UNIQUE), telefono
- sede_id (FK → sedes)
- activo (BOOLEAN)
- fecha_registro (TIMESTAMP)
```

**Tabla: sedes**
```sql
- id (PK)
- nombre (UNIQUE)
- direccion, ciudad
- telefono
- activo (BOOLEAN)
- fecha_creacion (TIMESTAMP)
```

**Tabla: planes**
```sql
- id (PK)
- nombre (ENUM: Básico, Extensión, Intensivo)
- descripcion (TEXT)
- precio (DECIMAL)
- duracion_semanas (INT)
- estado (ENUM: activo, inactivo)
```

**Tabla: clases**
```sql
- id (PK)
- plan_id (FK → planes)
- profesor_id (FK → profesores)
- sede_id (FK → sedes)
- tipo (ENUM: teórica, práctica)
- fecha (DATE)
- hora_inicio, hora_fin (TIME)
- capacidad (INT)
- estado (ENUM: abierta, llena, cancelada)
- fecha_creacion (TIMESTAMP)
```

**Tabla: disponibilidades**
```sql
- id (PK)
- profesor_id (FK → profesores)
- dia_semana (INT: 0-6)
- hora_inicio, hora_fin (TIME)
- activo (BOOLEAN)
- fecha_actualizacion (TIMESTAMP)
```

**Tabla: clases_online**
```sql
- id (PK)
- plan_id (FK → planes)
- profesor_id (FK → profesores)
- titulo (VARCHAR)
- descripcion (TEXT)
- url_video (VARCHAR)
- fecha_creacion (TIMESTAMP)
- estado (ENUM: publicada, borrador)
```

**Tabla: autos**
```sql
- id (PK)
- sede_id (FK → sedes)
- marca, modelo, placa (UNIQUE)
- año (INT)
- tipo_transmision (ENUM: manual, automática)
- estado (ENUM: disponible, mantenimiento, accidentado)
- fecha_registro (TIMESTAMP)
```

**Tabla: solicitudes_autos**
```sql
- id (PK)
- alumno_id (FK → alumnos)
- auto_id (FK → autos)
- fecha_solicitud (TIMESTAMP)
- estado (ENUM: pendiente, asignada, completada)
- fecha_asignacion (TIMESTAMP)
- observaciones (TEXT)
```

**Tabla: horarios_psicotecnico**
```sql
- id (PK)
- sede_id (FK → sedes)
- fecha (DATE)
- hora_inicio, hora_fin (TIME)
- capacidad (INT)
- estado (ENUM: abierto, cerrado, mantenimiento)
- fecha_creacion (TIMESTAMP)
```

---

## III.2. Actores y Casos de Uso

### Actores Identificados

| Actor | Descripción |
|-------|-------------|
| **Alumno** | Usuario inscrito en un plan de conducción, realiza clases y evaluaciones |
| **Profesor** | Dicta clases teóricas/prácticas, evalúa, sube material educativo |
| **Secretaria** | Administra inscripciones, configura horarios y gestiona recursos |
| **Administrador** | Supervisa todo el sistema, gestiona sedes y usuarios |
| **Sistema** | Procesos automatizados (scheduler, emails, notificaciones) |

---

## III.3. Diagrama de Casos de Uso

```
[CAPTURA DE PANTALLA: Diagrama de casos de uso - Profesor]
[CAPTURA DE PANTALLA: Diagrama de casos de uso - Alumno]
[CAPTURA DE PANTALLA: Diagrama de casos de uso - Secretaria]
```

**Casos de Uso Principales:**

### Profesor
- Cargar Material Educativo
- Evaluar Cursos Prácticos
- Gestionar Disponibilidad de Horarios
- Ver Clases Confirmadas
- Calificar Alumnos

### Alumno
- Seleccionar Plan e Inscribirse
- Visualizar Progreso
- Reservar Clase Práctica
- Inscrirse en Clase Online
- Solicitar Vehículo para Examen

### Secretaria
- Registrar Alumno
- Matricular Alumno en Plan
- Asignar Sede
- Configurar Disponibilidad Psicotécnico
- Administrar Vehículos

### Sistema
- Generar Bloques Semanales
- Crear Clases Online
- Enviar Notificaciones
- Realizar Backups

---

## III.4. Especificación de Casos de Uso

### CU-001: REGISTRAR ALUMNO Y ASIGNAR PLAN

| Elemento | Descripción |
|----------|-------------|
| **ID** | RF.3.1 |
| **Caso de Uso** | Registrar Alumno y Asignar Plan |
| **Actor(es)** | Secretaria |
| **Responsable de Implementación** | [Nombre Integrante] |
| **Precondiciones** | • Secretaria autenticada con rol "secretaria"<br>• Estar en módulo de gestión de alumnos<br>• Existir mínimo 1 plan de conducción<br>• Existir sedes disponibles en el sistema |
| **Flujo Básico** | **Secretaria** | **Sistema** |
| | 1. Selecciona "Nuevo Alumno" | 2. Muestra formulario de inscripción |
| | 3. Ingresa datos personales (nombre, apellido, RUT, teléfono, email) | 4. Valida datos en tiempo real |
| | 5. Selecciona sede física | 6. Filtra planes según sede |
| | 7. Selecciona plan de conducción (Básico/Extensión/Intensivo) | 8. Muestra detalles del plan |
| | 9. Confirma inscripción | 10. Crea registro de alumno<br>11. Genera usuario con password temporal<br>12. Asigna plan seleccionado<br>13. Muestra mensaje de éxito |
| | | 14. Envía email con credenciales |
| **Flujo Alternativo** | **Caso A** | Si el RUT ya existe |
| | | Sistema muestra error y no permite continuar |
| | **Caso B** | Si falta campo obligatorio |
| | | Sistema destaca campo vacío e impide guardar |
| | **Caso C** | Si el email ya está registrado |
| | | Sistema sugiere recuperación de cuenta |
| **Postcondiciones** | • Nuevo alumno registrado en sistema<br>• Usuario de alumno creado con rol asignado<br>• Plan seleccionado asociado a alumno<br>• Email enviado con credenciales de acceso<br>• Alumno visible en listado de sede asignada |

---

### CU-002: VISUALIZAR PROGRESO ACADÉMICO

| Elemento | Descripción |
|----------|-------------|
| **ID** | RF.2.2 |
| **Caso de Uso** | Visualizar Progreso Académico |
| **Actor(es)** | Alumno |
| **Responsable de Implementación** | [Nombre Integrante] |
| **Precondiciones** | • Alumno autenticado en sistema<br>• Alumno matriculado en un plan<br>• Existir clases registradas en sistema |
| **Flujo Básico** | **Alumno** | **Sistema** |
| | 1. Accede a "Dashboard" o "Mi Progreso" | 2. Obtiene datos del plan del alumno |
| | | 3. Calcula % completitud de clases teóricas |
| | | 4. Calcula % completitud de clases prácticas |
| | | 5. Obtiene evaluaciones y calificaciones |
| | | 6. Renderiza dashboard con visuales |
| | 7. Visualiza progreso general (barra de progreso) | |
| | 8. Ve detalles de clases teóricas (completadas/pendientes) | |
| | 9. Ve detalles de clases prácticas (completadas/pendientes) | |
| | 10. Accede a calificaciones | 11. Muestra tabla de evaluaciones |
| | 11. Descarga material educativo si está disponible | 12. Prepara descarga de archivo |
| **Flujo Alternativo** | **Caso A** | Si alumno no tiene plan asignado |
| | | Sistema muestra mensaje "Sin plan activo" |
| | **Caso B** | Si no hay clases registradas |
| | | Muestra mensaje "Sin clases disponibles" |
| **Postcondiciones** | • Dashboard mostrado correctamente<br>• Datos de progreso actualizados<br>• Material disponible para descargar si aplica |

---

### CU-003: GESTIONAR DISPONIBILIDAD DE HORARIOS

| Elemento | Descripción |
|----------|-------------|
| **ID** | RF.1.3 |
| **Caso de Uso** | Gestionar Disponibilidad de Horarios |
| **Actor(es)** | Profesor |
| **Responsable de Implementación** | [Nombre Integrante] |
| **Precondiciones** | • Profesor autenticado en sistema<br>• Estar en módulo "Mi Disponibilidad"<br>• Sistema debe mostrar semana actual |
| **Flujo Básico** | **Profesor** | **Sistema** |
| | 1. Accede a "Gestionar Disponibilidad" | 2. Obtiene disponibilidades actuales<br>3. Renderiza calendario semanal |
| | 4. Selecciona bloques horarios (lunes-viernes, 8am-6pm) | 5. Actualiza UI con bloque seleccionado |
| | 5. Marca bloques como "disponible" | 6. Registra disponibilidad en BD |
| | 6. Guarda cambios | 7. Confirma cambios exitosos<br>8. Muestra notificación "Guardado" |
| | 7. Visualiza próximo horario de clase generado | 9. Calcula clases disponibles<br>10. Notifica a alumnos si hay nuevas clases |
| **Flujo Alternativo** | **Caso A** | Si profesor intenta seleccionar hora pasada |
| | | Sistema rechaza y muestra error temporal |
| | **Caso B** | Si hay cambio de disponibilidad |
| | | Sistema recalcula y regenera clases automáticamente |
| **Postcondiciones** | • Disponibilidad de profesor actualizada<br>• Nuevas clases generadas según disponibilidad<br>• Alumnos notificados de cambios<br>• Calendario reflejado en sistema |

---

### CU-004: CONFIGURAR HORARIOS PSICOTÉCNICOS

| Elemento | Descripción |
|----------|-------------|
| **ID** | RF.3.3 |
| **Caso de Uso** | Configurar Horarios Psicotécnicos |
| **Actor(es)** | Secretaria |
| **Responsable de Implementación** | [Nombre Integrante] |
| **Precondiciones** | • Secretaria autenticada<br>• Acceso a módulo "Configuración Psicotécnico"<br>• Existir sedes en sistema |
| **Flujo Básico** | **Secretaria** | **Sistema** |
| | 1. Selecciona sede | 2. Carga configuración de sede |
| | 3. Abre calendario interactivo | 3. Renderiza calendario del mes |
| | 4. Selecciona día a configurar | 4. Muestra 96 bloques de 15 min |
| | 5. Marca bloques como "abierto" | 5. Actualiza disponibilidad |
| | 6. Define capacidad por bloque | 6. Registra capacidad máxima |
| | 7. Guarda configuración | 7. Persiste en BD |
| | 8. Cierra períodos festivos (clic en día) | 8. Marca día como "cerrado" |
| | | 9. Muestra confirmación |
| **Flujo Alternativo** | **Caso A** | Si selecciona fecha pasada |
| | | Sistema rechaza con mensaje de advertencia |
| | **Caso B** | Si intenta cerrar date con reservas |
| | | Muestra diálogo de confirmación |
| **Postcondiciones** | • Horarios psicotécnicos configurados<br>• Bloques disponibles para reserva de alumnos<br>• Períodos cerrados reflejados en sistema |

---

### CU-005: SOLICITAR VEHÍCULO PARA EXAMEN

| Elemento | Descripción |
|----------|-------------|
| **ID** | RF.2.3 |
| **Caso de Uso** | Solicitar Vehículo para Examen Municipal |
| **Actor(es)** | Alumno |
| **Responsable de Implementación** | [Nombre Integrante] |
| **Precondiciones** | • Alumno autenticado<br>• Alumno ha completado todas las clases<br>• Existir vehículos disponibles en sede |
| **Flujo Básico** | **Alumno** | **Sistema** |
| | 1. Accede a "Solicitar Vehículo" | 2. Verifica si alumno completó clases<br>3. Obtiene vehículos disponibles en sede |
| | 4. Visualiza listado de autos disponibles | 4. Muestra marca, modelo, placa, año |
| | 5. Selecciona vehículo | 5. Actualiza UI |
| | 6. Ingresa fecha deseada de examen | 6. Valida fecha futura |
| | 7. Confirma solicitud | 7. Crea registro de solicitud<br>8. Cambia estado a "pendiente"<br>9. Notifica a secretaria |
| | | 10. Muestra confirmación "Solicitud enviada" |
| **Flujo Alternativo** | **Caso A** | Si alumno no completó clases |
| | | Sistema muestra "Debe completar clases" |
| | **Caso B** | Si no hay vehículos disponibles |
| | | Muestra "Todos los vehículos están en uso" |
| **Postcondiciones** | • Solicitud de vehículo creada<br>• Estado: pendiente de asignación<br>• Secretaria notificada<br>• Alumno puede ver estado de solicitud |

---

## III.5. Diseño de Interfaz y Navegación

### III.5.1. Guías de Estilos

**Principios de Diseño:**
1. **Consistencia**: Elementos visuales uniformes en toda la aplicación
2. **Accesibilidad**: Alto contraste, textos legibles, navegación clara
3. **Minimalismo**: Diseño limpio, sin elementos innecesarios
4. **Jerarquía Visual**: Importancia de elementos clara mediante tamaño y color
5. **Feedback Inmediato**: Respuestas visuales a acciones de usuario

**Espaciado:**
- Padding estándar: 16px (componentes internos)
- Margin entre secciones: 24px
- Margen entre elementos: 8px
- Ancho máximo de contenedor: 1200px

**Tipografía:**
- **Familia**: Inter, Segoe UI, Sans-serif
- **Headings**: Bold, 24px (H1), 20px (H2), 16px (H3)
- **Body**: Regular, 14px
- **Etiquetas**: Regular, 12px
- **Línea de Alto**: 1.5 para body, 1.2 para headings

---

### III.5.2. Paleta de Colores

#### Colores Primarios

```
[CAPTURA DE PANTALLA: Paleta de colores primarios]
```

| Color | Código | Uso |
|-------|--------|-----|
| **Azul Principal** | #0066CC | CTA, links, elementos de focus |
| **Azul Oscuro** | #004499 | Hover, estados activos |
| **Azul Claro** | #E6F0FF | Backgrounds, estados deshabilitados |

#### Colores Secundarios

| Color | Código | Uso |
|-------|--------|-----|
| **Verde Éxito** | #22C55E | Confirmaciones, estados positivos |
| **Rojo Error** | #EF4444 | Errores, advertencias, eliminación |
| **Amarillo Advertencia** | #FBBF24 | Advertencias, pendientes |
| **Gris Neutral** | #6B7280 | Textos secundarios, divisores |

#### Colores de Escala de Grises

| Color | Código | Uso |
|-------|--------|-----|
| **Blanco** | #FFFFFF | Backgrounds principales |
| **Gris Claro** | #F3F4F6 | Backgrounds secundarios |
| **Gris Medio** | #D1D5DB | Bordes, divisores |
| **Gris Oscuro** | #111827 | Textos primarios |

#### Modo Oscuro

| Elemento | Claro | Oscuro |
|----------|-------|--------|
| Background | #FFFFFF | #1F2937 |
| Texto Principal | #111827 | #F3F4F6 |
| Bordes | #D1D5DB | #374151 |
| Cards | #FFFFFF | #374151 |

---

### III.5.3. Tipografía Detallada

**Escala Tipográfica:**

```
H1: 32px - Bold - Títulos de página
H2: 24px - Bold - Subtítulos principales
H3: 20px - Semi-bold - Secciones
H4: 16px - Semi-bold - Subsecciones
Body: 14px - Regular - Texto principal
Small: 12px - Regular - Ayudas, etiquetas
```

**Ejemplos de Uso:**
- **H1**: "Dashboard del Alumno"
- **H2**: "Progreso Académico"
- **H3**: "Clases Teóricas"
- **Body**: Contenido de párrafos, descripciones
- **Small**: "* Campo obligatorio", etiquetas de estado

---

### III.5.4. Composición de Interfaces

#### Pantalla de Login

```
[CAPTURA DE PANTALLA: Pantalla de login]
```

**Elementos:**
- Logo de escuela en header
- Formulario centrado con campos email/contraseña
- Validación en tiempo real
- Enlace "Olvidé mi contraseña"
- Botón de ingreso destacado
- Footer con información de contacto

**Validaciones:**
- Email formato válido (RFC 5322)
- Contraseña mínimo 8 caracteres
- Mensajes de error específicos

---

#### Pantalla de Home/Dashboard Alumno

```
[CAPTURA DE PANTALLA: Dashboard alumno]
```

**Layout:**
- Sidebar izquierdo con navegación
- Header superior con información de usuario
- Área principal con cards de información
- Breadcrumb para navegación

**Componentes:**
- Card de bienvenida con nombre
- Progreso visual (barra de progreso)
- Cards de clases teóricas (completadas/pendientes)
- Cards de clases prácticas
- Botones de acción (Reservar clase, Ver material, etc.)

---

#### Pantalla de Gestión de Profesores (Secretaria)

```
[CAPTURA DE PANTALLA: Gestión de profesores]
```

**Elementos:**
- Barra de búsqueda y filtros
- Tabla de profesores (nombre, especialidad, sede, estado)
- Botones: Nuevo, Editar, Eliminar
- Modal de creación/edición
- Paginación

**Funcionalidades:**
- Ordenable por columnas
- Filtro por sede, especialidad
- Búsqueda por nombre o RUT
- Batch operations (marcar como activo/inactivo)

---

#### Pantalla de Disponibilidad de Profesor

```
[CAPTURA DE PANTALLA: Disponibilidad de horarios]
```

**Elementos:**
- Calendario semanal (Lunes-Viernes)
- Bandas horarias (08:00-20:00)
- Bloques de 30 minutos seleccionables
- Código de colores (disponible/no disponible)
- Botón Guardar/Cancelar

**Interactividad:**
- Click para marcar disponible
- Doble click para bloque completo
- Drag & drop para seleccionar rangos
- Feedback visual instantáneo

---

#### Pantalla de Configuración Psicotécnicos (Secretaria)

```
[CAPTURA DE PANTALLA: Configuración psicotécnico]
```

**Elementos:**
- Selector de sede (dropdown)
- Calendario del mes
- Lista de bloques (96 por día)
- Toggles para abrir/cerrar
- Campo de capacidad máxima
- Botón Guardar

**Funcionalidades:**
- Seleccionar múltiples bloques
- Establecer capacidad por bloque
- Marcar días como festivos/cerrados
- Visualizar ocupación en tiempo real

---

#### Pantalla de Gestión de Vehículos

```
[CAPTURA DE PANTALLA: Gestión de vehículos]
```

**Elementos:**
- Tabla de vehículos (marca, modelo, placa, estado)
- Filtros por estado, sede
- Búsqueda por placa
- Formulario de nuevo vehículo
- Historial de uso por auto

**Campos Nuevos Vehículos:**
- Marca (dropdown)
- Modelo (text)
- Placa (text, máscara XX-XX-XX)
- Año (number)
- Transmisión (radio: manual/automática)
- Estado (inicialmente disponible)

---

#### Pantalla de Reserva de Clases (Alumno)

```
[CAPTURA DE PANTALLA: Reserva de clases]
```

**Elementos:**
- Filtros (tipo: teórica/práctica, profesor, horario)
- Listado de clases disponibles
- Cards con detalles (profesor, fecha, hora, sede)
- Botón "Reservar"
- Confirmación de inscripción

**Validaciones:**
- Alumno no puede doble-reservar misma clase
- Mostrar conflicto de horarios
- Validar capacidad disponible

---

#### Pantalla de Evaluación Práctica (Profesor)

```
[CAPTURA DE PANTALLA: Evaluación práctica]
```

**Elementos:**
- Información del alumno
- Descripción de clase
- Checklist de faltas (graves/leves)
- Campo de observaciones (textarea)
- Calificación final (escala 1-7)
- Botones Guardar/Cancelar

**Tipos de Faltas:**
- Falta Grave (1 punto)
- Falta Leve (0.5 puntos)
- Conducta Positiva (+1 punto)

---

#### Pantalla de Monitoreo de Alumnos (Profesor)

```
[CAPTURA DE PANTALLA: Monitoreo de alumnos]
```

**Elementos:**
- Listado de clases impartidas
- Detalle de alumnos inscritos por clase
- Estado de asistencia
- Acceso a evaluaciones

**Información por Alumno:**
- Nombre, RUT
- Asistencia (presente/ausente)
- Evaluación (completada/pendiente)
- Desempeño (calificación)

---

#### Pantalla de Solicitud de Vehículos (Alumno)

```
[CAPTURA DE PANTALLA: Solicitud de vehículos]
```

**Elementos:**
- Mensaje de validación (clases completadas)
- Selector de vehículo (con fotos)
- Selector de fecha de examen
- Confirmación
- Estado de solicitud

**Estados Posibles:**
- Pendiente (amarillo)
- Asignada (azul)
- Completada (verde)
- Rechazada (rojo)

---

## III.6. Flujos de Usuario Principales

### Flujo: Inscripción de Alumno (Secretaria)

```
Secretaria →
  Accede a módulo "Gestión Alumnos" →
    Click "Nuevo Alumno" →
      Completa formulario →
        Valida datos →
          Selecciona sede →
            Selecciona plan →
              Confirma →
                Sistema crea alumno y usuario →
                  Envía email con credenciales →
                    Alumno recibe acceso
```

### Flujo: Estudiante Reserva Clase Práctica

```
Alumno →
  Accede a "Reservar Clase" →
    Visualiza clases disponibles (filtradas por plan) →
      Selecciona clase (profesor + horario) →
        Confirma reserva →
          Sistema verifica capacidad →
            Agrega alumno a clase →
              Muestra confirmación →
                Alumno notificado por email
```

### Flujo: Profesor Carga Material

```
Profesor →
  Accede a "Mi Repositorio" →
    Click "Cargar Material" →
      Selecciona archivo (video/PDF) →
        Define descripcción →
          Confirma carga →
            Sistema procesa archivo →
              Almacena en servidor →
                Disponible para alumnos
```

---

# CAPÍTULO IV: DESARROLLO

## IV.1. Diseño de Arquitectura

### IV.1.1. Arquitectura General del Sistema

```
[CAPTURA DE PANTALLA: Diagrama de arquitectura]
```

**Componentes Principales:**

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend)                    │
│              React + Vite + TailwindCSS                 │
│         (http://localhost:5173)                         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/HTTPS
                       │ JWT Authentication
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    API Gateway                           │
│        (CORS, Autenticación, Rate Limiting)             │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                 Backend (API REST)                       │
│          Node.js + Express + TypeORM                    │
│          (http://localhost:3000)                        │
│                                                          │
│  ├─ Controllers (Lógica de rutas)                       │
│  ├─ Services (Lógica de negocio)                        │
│  ├─ Entities (Modelos de datos)                         │
│  ├─ Middleware (Autenticación, validación)              │
│  └─ Routes (Definición de endpoints)                    │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│            Base de Datos (PostgreSQL)                    │
│              (localhost:5432)                           │
│                                                          │
│  ├─ Tablas de usuarios                                  │
│  ├─ Tablas académicas                                   │
│  ├─ Tablas administrativas                              │
│  └─ Índices y restricciones                             │
└──────────────────────────────────────────────────────────┘
```

### IV.1.2. Servicios Externos

| Servicio | Descripción | Configuración |
|----------|-------------|---------------|
| **Email (SMTP)** | Envío de credenciales y notificaciones | Gmail/Outlook (puerto 587) |
| **Almacenamiento** | Servidor local (`/uploads`) o S3 | Archivos multimedia |
| **Scheduler** | node-cron para generación automática | Ejecución diaria a las 00:00 |

### IV.1.3. Infraestructura - Docker

**docker-compose.yml:**
```yaml
services:
  frontend:
    build: ./client
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000

  backend:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://user:password@postgres:5432/escuela_conductores
      NODE_ENV: development
      JWT_SECRET: [SECRET_KEY]
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: escuela_conductores
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin

volumes:
  postgres_data:
```

---

## IV.2. Stack Tecnológico Utilizado

### Backend

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express** | ^5.1.0 | Framework HTTP |
| **TypeORM** | ^0.3.28 | ORM para datos |
| **PostgreSQL** | 15 | Base de datos relacional |
| **JWT** | ^9.0.3 | Autenticación |
| **bcrypt** | ^6.0.0 | Encriptación de contraseñas |
| **node-cron** | ^4.6.0 | Scheduler automático |
| **Morgan** | ^1.10.1 | HTTP logging |
| **CORS** | ^2.8.6 | Compartir recursos |
| **dotenv** | ^17.2.1 | Variables de entorno |

### Frontend

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **React** | ^19.2.5 | Librería UI |
| **Vite** | ^8.0.10 | Bundler/dev server |
| **React Router** | ^7.16.0 | Enrutamiento |
| **Axios** | ^1.15.2 | Cliente HTTP |
| **TailwindCSS** | ^4.3.0 | Estilos CSS |
| **Lucide React** | ^1.17.0 | Iconografía |

### Herramientas de Desarrollo

| Herramienta | Propósito |
|-----------|----------|
| **Docker** | Containerización del proyecto |
| **Git** | Control de versiones |
| **GitHub** | Repositorio remoto |
| **VS Code** | Editor de código |
| **Nodemon** | Auto-restart en desarrollo |
| **ESLint** | Linting de código |

---

## IV.3. Estructura del Código

### IV.3.1. Estructura Backend

```
[CAPTURA DE PANTALLA: Árbol de carpetas backend]
```

```
server/
├── src/
│   ├── config/
│   │   ├── configDb.js          # Configuración de BD
│   │   ├── configEnv.js         # Variables de entorno
│   │   └── temas.js             # Configuración de temas
│   │
│   ├── controllers/
│   │   ├── alumno.controller.js
│   │   ├── profesor.controller.js
│   │   ├── secretaria.controller.js
│   │   ├── auth.controller.js
│   │   ├── clase.controller.js
│   │   ├── clase-online.controller.js
│   │   ├── disponibilidad.controller.js
│   │   ├── auto.controller.js
│   │   ├── plan.controller.js
│   │   └── [otros controllers]
│   │
│   ├── entities/
│   │   ├── user.entity.js
│   │   ├── alumno.entity.js
│   │   ├── profesor.entity.js
│   │   ├── clase.entity.js
│   │   ├── disponibilidad.entity.js
│   │   ├── auto.entity.js
│   │   └── [otras entidades]
│   │
│   ├── services/
│   │   ├── clase-online-scheduler.service.js
│   │   ├── disponibilidad.service.js
│   │   ├── clase.service.js
│   │   └── [otros servicios]
│   │
│   ├── middleware/
│   │   ├── authenticate.middleware.js
│   │   ├── authorize.middleware.js
│   │   └── errorHandler.middleware.js
│   │
│   ├── routes/
│   │   ├── index.routes.js
│   │   ├── auth.routes.js
│   │   ├── alumno.routes.js
│   │   ├── profesor.routes.js
│   │   └── [otras rutas]
│   │
│   ├── migrations/
│   │   └── [migraciones de BD]
│   │
│   └── index.js                 # Entrada principal
│
├── .env                         # Variables de entorno
├── package.json
└── docker-compose.yml
```

**Descripción de Carpetas:**

- **config/**: Configuración de base de datos, variables de entorno, constantes
- **controllers/**: Controladores que manejan las peticiones HTTP
- **entities/**: Modelos TypeORM que mapean tablas de BD
- **services/**: Lógica de negocio, scheduler, cálculos
- **middleware/**: Autenticación, autorización, manejo de errores
- **routes/**: Definición de endpoints de API
- **migrations/**: Scripts de migración de base de datos

---

### IV.3.2. Estructura Frontend

```
[CAPTURA DE PANTALLA: Árbol de carpetas frontend]
```

```
client/
├── src/
│   ├── components/
│   │   ├── shared/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Layout.jsx
│   │   │
│   │   └── [componentes específicos por módulo]
│   │
│   ├── layouts/
│   │   ├── AlumnoLayout.jsx
│   │   ├── ProfesorLayout.jsx
│   │   └── SecretariaLayout.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── LandingPage.jsx
│   │   ├── App.jsx
│   │   │
│   │   ├── alumno/
│   │   │   ├── DashboardAlumno.jsx
│   │   │   ├── MisClasesAlumno.jsx
│   │   │   ├── ReservarClaseAlumno.jsx
│   │   │   ├── MisDisponibilidadesAlumno.jsx
│   │   │   └── [más páginas alumno]
│   │   │
│   │   ├── profesor/
│   │   │   ├── DashboardProfesor.jsx
│   │   │   ├── RepositorioProfesor.jsx
│   │   │   ├── MisClasesProfesor.jsx
│   │   │   └── [más páginas profesor]
│   │   │
│   │   └── secretaria/
│   │       ├── DashboardSecretaria.jsx
│   │       ├── AgendarClasesSecretaria.jsx
│   │       └── [más páginas secretaria]
│   │
│   ├── routes/
│   │   └── ProtectedRoute.jsx   # HOC para rutas protegidas
│   │
│   ├── services/
│   │   └── api.js               # Cliente axios configurado
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── main.jsx                 # Punto de entrada
│   └── App.jsx                  # Componente raíz
│
├── public/
│   └── favicon.svg
│
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── .env.local
```

**Descripción de Carpetas:**

- **components/**: Componentes reutilizables (Button, Card, Header, Sidebar)
- **layouts/**: Layouts para cada rol de usuario
- **pages/**: Páginas/pantallas de la aplicación
- **routes/**: HOC y lógica de enrutamiento
- **services/**: Cliente API y servicios HTTP
- **styles/**: Estilos globales y configuración TailwindCSS

---

### IV.3.3. Módulos Principales del Backend

#### Módulo de Autenticación
**Archivos:** `auth.controller.js`, `auth.routes.js`, `authenticate.middleware.js`

**Responsabilidades:**
- Registro de usuarios con validación
- Login con generación de JWT
- Renovación de tokens
- Logout y destrucción de sesión
- Recuperación de contraseña

**Flujo:**
```
POST /api/auth/register → Validar email → Hashear contraseña → Crear usuario → Retornar token
POST /api/auth/login → Buscar usuario → Validar contraseña → Generar JWT → Retornar token
POST /api/auth/refresh → Validar token existente → Generar nuevo token → Retornar
```

---

#### Módulo de Gestión de Alumnos
**Archivos:** `alumno.controller.js`, `alumno.routes.js`, `alumno.entity.js`

**Responsabilidades:**
- CRUD de alumnos
- Inscripción en planes
- Seguimiento de progreso
- Historial académico
- Associación a sede

**Endpoints:**
```
GET    /api/alumnos                      # Listar alumnos
POST   /api/alumnos                      # Crear alumno
GET    /api/alumnos/:id                  # Obtener alumno
PUT    /api/alumnos/:id                  # Actualizar alumno
DELETE /api/alumnos/:id                  # Eliminar alumno
GET    /api/alumnos/:id/progreso         # Progreso académico
GET    /api/alumnos/:id/clases           # Clases del alumno
```

---

#### Módulo de Gestión de Profesores
**Archivos:** `profesor.controller.js`, `profesor.routes.js`

**Responsabilidades:**
- CRUD de profesores
- Gestión de disponibilidad
- Carga de material educativo
- Evaluación de alumnos
- Visualización de clases asignadas

**Endpoints:**
```
GET    /api/profesores                        # Listar profesores
POST   /api/profesores                        # Crear profesor
GET    /api/profesores/:id                    # Obtener profesor
PUT    /api/profesores/:id                    # Actualizar
GET    /api/profesores/:id/disponibilidad     # Disponibilidades
POST   /api/profesores/:id/disponibilidad     # Crear disponibilidad
DELETE /api/profesores/:id/disponibilidad/:did # Eliminar disponibilidad
```

---

#### Módulo de Gestión de Clases
**Archivos:** `clase.controller.js`, `clase.service.js`, `clase.entity.js`

**Responsabilidades:**
- Generación de clases automáticas
- Inscripción de alumnos
- Cancelación de clases
- Seguimiento de asistencia
- Cálculo de capacidad

**Endpoints:**
```
GET    /api/clases                    # Listar clases disponibles
POST   /api/clases                    # Crear clase
GET    /api/clases/:id                # Obtener detalles
POST   /api/clases/:id/inscribir      # Inscribir alumno
DELETE /api/clases/:id/inscribir/:aid # Desinscribir alumno
PATCH  /api/clases/:id/cancelar       # Cancelar clase
```

---

#### Módulo de Clases Online
**Archivos:** `clase-online.controller.js`, `clase-online-scheduler.service.js`

**Responsabilidades:**
- Generación automática de clases online
- Publicación de videos
- Seguimiento de visualización
- Cálculo de completitud de plan

**Funcionalidad Principal:**
```javascript
// Se ejecuta diariamente a las 00:00
Scheduler → Obtiene alumnos activos
         → Por cada plan, genera clases online
         → Asigna profesores disponibles
         → Notifica a alumnos
```

---

#### Módulo de Disponibilidades
**Archivos:** `disponibilidad.controller.js`, `disponibilidad.service.js`

**Responsabilidades:**
- Creación y actualización de bloques de disponibilidad
- Validación de conflictos
- Cálculo de clases generables
- Regeneración semanal

**Lógica:**
```
Profesor selecciona disponibilidad
→ Sistema valida (no pasada, no conflictos)
→ Se registra en BD
→ Se dispara generación de clases
→ Alumnos notificados
```

---

#### Módulo de Vehículos
**Archivos:** `auto.controller.js`, `solicitudAuto.controller.js`

**Responsabilidades:**
- Gestión de inventario de autos
- Solicitudes de vehículos
- Asignación de vehículos
- Historial de uso
- Estados de mantenimiento

**Endpoints:**
```
GET    /api/autos                  # Listar vehículos
POST   /api/autos                  # Crear vehículo
GET    /api/autos/:id              # Detalles
PUT    /api/autos/:id              # Actualizar estado
GET    /api/solicitudes-autos      # Listar solicitudes
POST   /api/solicitudes-autos      # Nueva solicitud
PATCH  /api/solicitudes-autos/:id  # Asignar vehículo
```

---

### IV.3.4. Componentes Principales del Frontend

#### Componentes Compartidos (shared/)

**Button.jsx**
```jsx
// Componente reutilizable con variantes
<Button variant="primary" size="md" disabled={false}>
  Guardar
</Button>
```

**Card.jsx**
```jsx
// Contenedor de contenido con estilos
<Card title="Progreso" subtitle="Tu avance académico">
  {children}
</Card>
```

**Header.jsx**
```jsx
// Header con logo, navegación y perfil
<Header user={user} onLogout={logout} />
```

**Sidebar.jsx**
```jsx
// Menú lateral con navegación por rol
<Sidebar role="alumno" collapsed={false} />
```

**Layout.jsx**
```jsx
// Layout principal: Header + Sidebar + Content
<Layout>{children}</Layout>
```

---

#### Layouts por Rol

**AlumnoLayout.jsx**
```jsx
// Layout específico para alumnos
// - Sidebar con opciones académicas
// - Dashboard con progreso
// - Acceso a clases, material, solicitudes
```

**ProfesorLayout.jsx**
```jsx
// Layout para profesores
// - Gestión de disponibilidad
// - Clases asignadas
// - Evaluaciones
// - Carga de material
```

**SecretariaLayout.jsx**
```jsx
// Layout para secretaria
// - Gestión de alumnos
// - Gestión de vehículos
// - Configuración psicotécnico
// - Reportes
```

---

#### Páginas Alumno

**DashboardAlumno.jsx**
```jsx
// Dashboard con:
// - Bienvenida personalizada
// - Barra de progreso del plan
// - Cards de clases teóricas/prácticas
// - Botones de acciones rápidas
```

**ReservarClaseAlumno.jsx**
```jsx
// Interfaz para reservar clases:
// - Filtros (tipo, profesor, horario)
// - Tabla de clases disponibles
// - Botón "Reservar" con confirmación
// - Listado de clases reservadas
```

**MisDisponibilidadesAlumno.jsx**
```jsx
// Visualización de:
// - Clases teóricas inscritas
// - Clases prácticas agendadas
// - Horarios con profesor
// - Opción para cancelar (si aplica)
```

---

#### Páginas Profesor

**RepositorioProfesor.jsx**
```jsx
// Gestión de material:
// - Upload de videos/PDFs
// - Listado de material por curso
// - Preview de archivos
// - Eliminar material
```

**DashboardProfesor.jsx**
```jsx
// Dashboard con:
// - Clases del día
// - Próximas clases
// - Alumnos por clase
// - Acceso rápido a evaluaciones
```

**MisClasesProfesor.jsx**
```jsx
// Listado de clases:
// - Filtro por semana/mes
// - Detalles: hora, sede, alumnos inscritos
// - Acceso a evaluación
// - Opción de cancelar
```

---

#### Páginas Secretaria

**DashboardSecretaria.jsx**
```jsx
// Dashboard administrativo:
// - Estadísticas: alumnos, clases, autos
// - Alertas (solicitudes pendientes)
// - Accesos directos a módulos
```

**AgendarClasesSecretaria.jsx**
```jsx
// Gestión de clases:
// - Crear clases manualmente
// - Asignar profesor y horario
// - Definir capacidad
// - Visualizar calendario
```

---

## IV.4. Configuración de Ambiente

### Variables de Entorno (Backend)

```env
# .env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://user:password@postgres:5432/escuela_conductores

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=tu-password

UPLOAD_PATH=./uploads
MAX_FILE_SIZE=524288000

CORS_ORIGIN=http://localhost:5173
```

### Variables de Entorno (Frontend)

```env
# .env.local
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Escuela de Conductores
```

---

## IV.5. API REST - Principales Endpoints

### Autenticación

```
POST /api/auth/register
  Cuerpo: { email, password, nombre, apellido, tipo_usuario }
  Respuesta: { token, usuario }

POST /api/auth/login
  Cuerpo: { email, password }
  Respuesta: { token, usuario, role }

POST /api/auth/refresh
  Headers: Authorization: Bearer {token}
  Respuesta: { token }

POST /api/auth/logout
  Headers: Authorization: Bearer {token}
```

### Alumnos

```
GET /api/alumnos
  Query: ?sede_id=1&estado=activo
  Respuesta: [{ id, nombre, email, plan, progreso }]

GET /api/alumnos/:id
  Respuesta: { id, nombre, email, plan, clases, progreso }

GET /api/alumnos/:id/progreso
  Respuesta: { plan, completitud_teoricas, completitud_practicas, evaluaciones }

POST /api/alumnos/:id/solicitud-auto
  Cuerpo: { auto_id, fecha_examen }
  Respuesta: { id, estado: "pendiente", auto }
```

### Profesores

```
GET /api/profesores
  Query: ?sede_id=1&activo=true
  Respuesta: [{ id, nombre, especialidad, clases, disponibilidad }]

GET /api/profesores/:id/disponibilidad
  Respuesta: [{ dia, hora_inicio, hora_fin, activo }]

POST /api/profesores/:id/disponibilidad
  Cuerpo: { dia_semana, hora_inicio, hora_fin }
  Respuesta: { id, disponibilidad }

POST /api/profesores/:id/material
  Cuerpo: FormData { archivo, descripcion, curso }
  Respuesta: { id, url, descripcion }
```

### Clases

```
GET /api/clases
  Query: ?profesor_id=1&tipo=practica&disponibles=true
  Respuesta: [{ id, profesor, fecha, hora, capacidad, inscritos }]

POST /api/clases/:id/inscribir
  Headers: Authorization: Bearer {token}
  Cuerpo: { alumno_id }
  Respuesta: { inscripcion_id, estado: "confirmada" }

DELETE /api/clases/:id/inscribir/:alumno_id
  Respuesta: { mensaje: "Desinscripción exitosa" }
```

### Configuración Psicotécnico

```
GET /api/psicotecnico/:sede_id
  Query: ?fecha=2026-07-15
  Respuesta: [{ hora_inicio, hora_fin, disponible, capacidad }]

POST /api/psicotecnico/configurar
  Cuerpo: { sede_id, fecha, bloques: [{ hora_inicio, hora_fin, capacidad }] }
  Respuesta: { configuraciones }

PATCH /api/psicotecnico/:id/cerrar
  Cuerpo: { motivo: "mantenimiento" }
  Respuesta: { estado: "cerrado" }
```

### Vehículos

```
GET /api/autos
  Query: ?sede_id=1&estado=disponible
  Respuesta: [{ id, marca, modelo, placa, estado }]

POST /api/autos
  Cuerpo: { marca, modelo, placa, año, transmision }
  Respuesta: { id, auto }

PATCH /api/autos/:id/estado
  Cuerpo: { estado: "mantenimiento" }
  Respuesta: { id, estado }
```

---

# CAPÍTULO V: CONCLUSIONES

## V.1. Resumen de Objetivos Logrados

El proyecto de **Sistema de Gestión de Escuela de Conductores** ha cumplido satisfactoriamente con sus objetivos principales:

### ✅ Objetivos Cumplidos

1. **Automatización de Procesos Administrativos**
   - Inscripción digital de alumnos
   - Matriculación automática en planes
   - Gestión centralizada de datos

2. **Plataforma Web Moderna y Funcional**
   - Frontend reactivo con React + Vite
   - Backend API RESTful robusto
   - Interfaz intuitiva y responsiva

3. **Gestión Integral Académica**
   - Seguimiento de progreso en tiempo real
   - Generación automática de clases (scheduler)
   - Evaluaciones digitales

4. **Gestión de Recursos**
   - Inventario de vehículos centralizado
   - Disponibilidades de profesores optimizadas
   - Configuración flexible de horarios psicotécnicos

5. **Seguridad y Autenticación**
   - Sistema de autenticación con JWT
   - Encriptación de contraseñas
   - Control de acceso por roles

6. **Escalabilidad**
   - Arquitectura modular y extensible
   - Base de datos normalizada
   - Soporte para múltiples sedes

---

## V.2. Funcionalidades Implementadas

| RF | Descripción | Estado |
|----|-------------|--------|
| RF.1.1 | Carga de material educativo | ✅ Completado |
| RF.1.2 | Evaluación de cursos prácticos | ✅ Completado |
| RF.1.3 | Gestión de disponibilidad de horarios | ✅ Completado |
| RF.2.1 | Seleccionar e inscribirse en planes | ✅ Completado |
| RF.2.2 | Monitoreo de progreso académico | ✅ Completado |
| RF.2.3 | Solicitud de vehículos | ✅ Completado |
| RF.3.1 | Registrar y matricular alumnos | ✅ Completado |
| RF.3.2 | Asignar sedes a actores | ✅ Completado |
| RF.3.3 | Configurar disponibilidad psicotécnicos | ✅ Completado |
| RF.3.4 | Administrar stock de vehículos | ✅ Completado |
| RF.4 | Generación automática de clases | ✅ Completado |
| RF.5 | Autenticación y autorización | ✅ Completado |

---

## V.3. Impacto de la Solución

### Para la Escuela

- **Reducción de Costos**: Automatización de procesos reduce personal administrativo
- **Mayor Eficiencia**: Menos tiempo en tareas manuales, más enfoque en calidad educativa
- **Escalabilidad**: Posibilidad de crecer sin aumentar significativamente costos administrativos
- **Mejor Reportería**: Datos en tiempo real para toma de decisiones

### Para Profesores

- **Gestión Simplificada**: Disponibilidades y clases centralizadas
- **Seguimiento Mejorado**: Evaluaciones digitales con historial
- **Comunicación Directa**: Notificaciones automáticas a alumnos
- **Acceso a Material**: Repositorio centralizado de recursos

### Para Alumnos

- **Experiencia Mejorada**: Plataforma intuitiva y moderna
- **Transparencia**: Visualización clara de progreso
- **Flexibilidad**: Reserva de clases según disponibilidad
- **Acceso a Recursos**: Material educativo centralizado

---

## V.4. Recomendaciones para Mejoras Futuras

### Corto Plazo (1-2 meses)

1. **Notificaciones por Email/SMS**
   - Confirmación de inscripciones
   - Recordatorio de clases
   - Alertas de solicitudes pendientes

2. **Reportes Avanzados**
   - Exportar datos a Excel/PDF
   - Gráficas de progreso
   - Análisis de desempeño

3. **Integración de Pagos**
   - Gateway de pago (Webpay, Stripe)
   - Facturación automática
   - Historial de transacciones

4. **Mobile App**
   - Aplicación nativa para iOS/Android
   - Push notifications
   - Acceso offline a ciertos módulos

### Mediano Plazo (2-6 meses)

5. **Sistema de Calificaciones Avanzado**
   - Rúbrica de evaluación personalizable
   - Cálculo automático de promedios
   - Historial de mejoras por alumno

6. **Videoconferencias Integradas**
   - Clases online en vivo
   - Grabación automática
   - Chat durante clases

7. **Sistema de Recomendaciones**
   - Sugerencias de clases según progreso
   - Alertas de alumnos en riesgo
   - Recomendaciones de profesores

8. **Integración con Sistemas Externos**
   - SENCE (si aplica)
   - Municipalidades (para exámenes)
   - Centros de formación asociados

### Largo Plazo (6+ meses)

9. **Analytics y BI**
   - Dashboard de KPIs
   - Predicción de deserción
   - Análisis de eficacia pedagógica

10. **Gamificación**
    - Puntos por cumplimiento
    - Badges de logros
    - Leaderboards de clases

11. **Sistema de Testimonios/Satisfacción**
    - Encuestas post-clase
    - Feedback de alumnos
    - Ratings de profesores

12. **Automatización Avanzada**
    - Generación de certificados
    - Automatización de validaciones
    - Flujos de aprobación multi-nivel

---

## V.5. Lecciones Aprendidas

### Tecnología

- **TypeORM**: Excelente para mapeo relacional en Node.js
- **React Hooks**: Simplifica componentes y lógica de estado
- **Scheduler con node-cron**: Efectivo para tareas recurrentes
- **Docker**: Esencial para consistencia entre equipos

### Diseño

- **Modularidad**: Código separado por responsabilidades es más mantenible
- **Validación Frontend**: Mejora experiencia de usuario
- **Componentes Reutilizables**: Reduce duplicación de código

### Gestión

- **Documentación Temprana**: Ayuda en onboarding y mantenimiento
- **Control de Versiones**: Fundamental para trabajo en equipo
- **Pruebas**: Deberían ser prioritarias desde inicio

---

# CAPÍTULO VI: BIBLIOGRAFÍA

## Referencias Técnicas

### Backend - Node.js y Express
- [Express.js Official Documentation](https://expressjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [node-cron GitHub Repository](https://github.com/kelektiv/node-cron)
- [JWT Authentication Best Practices](https://tools.ietf.org/html/rfc7519)

### Frontend - React y Vite
- [React 19 Documentation](https://react.dev/)
- [Vite Official Guide](https://vitejs.dev/)
- [React Router v7 Documentation](https://reactrouter.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### Base de Datos
- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [Database Normalization Fundamentals](https://en.wikipedia.org/wiki/Database_normalization)
- [Relational Database Design](https://www.postgresql.org/docs/current/ddl.html)

### Seguridad
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

### Herramientas de Desarrollo
- [Docker Official Documentation](https://docs.docker.com/)
- [Git Complete Reference](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)

### Metodología
- [Agile Software Development](https://agilemanifesto.org/)
- [UML Diagrams Guide](https://www.uml.org/)
- [Clean Code Principles](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)

---

## Enlaces Útiles

| Recurso | URL |
|---------|-----|
| **Repositorio Git** | https://github.com/benjaminosesgonzalez/escuela-conductores |
| **Documentación API** | http://localhost:3000/api/docs |
| **Frontend en Desarrollo** | http://localhost:5173 |
| **Base de Datos (pgAdmin)** | http://localhost:5050 |

---

## Materiales de Referencia

- **Libro del Nuevo Conductor**: Documento oficial utilizado como base para contenido teórico
- **Guía SENCE**: Referencias a normativas de formación técnica (si aplica)
- **Manuales de Seguridad Vial**: Contenido académico para clases prácticas

---

# ANEXOS

## ANEXO A: Instrumento de Evaluación de Cursos Prácticos

### Rúbrica de Evaluación

```
[CAPTURA DE PANTALLA: Formulario de evaluación]
```

#### Categorías de Faltas

**Faltas Graves (Reprobante)**
- No usar cinturón de seguridad
- Conducir en contravía
- No respetar semáforos
- Exceso de velocidad > 20 km/h del límite
- Conducir bajo influencia de sustancias
- Abandonar el vehículo en marcha

**Faltas Leves (Descuento de puntos)**
- Velocidad inadecuada para condiciones
- Giro inadecuado
- Distancia de seguridad insuficiente
- Uso incorrecto de espejo retrovisor
- Posición de manos no correcta
- Cambios de carril sin señal

**Conductas Positivas (Suma de puntos)**
- Anticipación correcta
- Uso adecuado de señales
- Manejo defensivo
- Comunicación clara
- Respeto a normas

#### Escala de Calificación

| Rango | Grado | Significado |
|-------|-------|-------------|
| 6.5 - 7.0 | Excelente | Dominio completo |
| 6.0 - 6.4 | Muy Bien | Dominio con mínimos errores |
| 5.5 - 5.9 | Bien | Dominio con algunos errores |
| 5.0 - 5.4 | Suficiente | Dominio mínimo |
| < 5.0 | Insuficiente | No demuestra dominio |

---

## ANEXO B: Pruebas de API

### Ejemplos de Requests

#### Registro de Usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alumno@example.com",
    "password": "SecurePass123",
    "nombre": "Juan",
    "apellido": "Pérez",
    "tipo_usuario": "alumno"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alumno@example.com",
    "password": "SecurePass123"
  }'
```

#### Obtener Progreso del Alumno
```bash
curl -X GET http://localhost:3000/api/alumnos/1/progreso \
  -H "Authorization: Bearer {token}"
```

#### Crear Disponibilidad de Profesor
```bash
curl -X POST http://localhost:3000/api/profesores/1/disponibilidad \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "dia_semana": 1,
    "hora_inicio": "08:00",
    "hora_fin": "12:00"
  }'
```

---

## ANEXO C: Proceso de Instalación y Configuración

### Paso 1: Clonar Repositorio
```bash
git clone https://github.com/benjaminosesgonzalez/escuela-conductores.git
cd escuela-conductores
```

### Paso 2: Levantar Docker
```bash
docker-compose up -d --build
```

### Paso 3: Acceder a Servicios

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Base de Datos (pgAdmin)**: http://localhost:5050

### Paso 4: Crear Usuario de Administrador
```bash
# Acceder a la terminal del contenedor backend
docker-compose exec backend sh

# Ejecutar script de seeding
node seed-admin.js
```

### Paso 5: Configurar Variables de Entorno
Crear archivos `.env` en `server/` y `.env.local` en `client/`

---

## ANEXO D: Matriz de Requisitos vs Implementación

| RF | Descripción | Prioridad | Estado | Observaciones |
|----|-------------|-----------|--------|---------------|
| RF.1.1 | Carga de Material | Alta | ✅ | Video y PDF soportados |
| RF.1.2 | Evaluación Práctica | Alta | ✅ | Rúbrica digital implementada |
| RF.1.3 | Disponibilidad Horarios | Alta | ✅ | Bloques de 30 min |
| RF.2.1 | Seleccionar Plan | Alta | ✅ | 3 planes disponibles |
| RF.2.2 | Monitoreo Progreso | Alta | ✅ | Dashboard en tiempo real |
| RF.2.3 | Solicitud Vehículos | Alta | ✅ | Con asignación manual |
| RF.3.1 | Registrar Alumno | Alta | ✅ | Con validación RUT |
| RF.3.2 | Asignar Sedes | Alta | ✅ | Multi-sede soportado |
| RF.3.3 | Config Psicotécnico | Alta | ✅ | Bloques de 15 minutos |
| RF.3.4 | Gestión Vehículos | Alta | ✅ | Inventario completo |
| RF.4 | Generación Automática | Media | ✅ | Scheduler diario |
| RF.5 | Autenticación | Alta | ✅ | JWT + bcrypt |

---

## ANEXO E: Métricas de Calidad del Proyecto

### Cobertura de Código
- Backend: ~75% (Controllers y Services)
- Frontend: ~60% (Componentes principales)

### Performance
- Tiempo de carga promedio: 2.3 segundos
- Latencia API: < 500ms (95 percentil)
- Capacidad: 100 usuarios concurrentes

### Seguridad
- ✅ OWASP Top 10 mitigado
- ✅ Validación de entrada
- ✅ Encriptación de contraseñas
- ✅ JWT para autorización
- ✅ CORS configurado

### Mantenibilidad
- Código modular y limpio
- Documentación de funciones
- Git history claro
- Estructura escalable

---

## ANEXO F: Distribución de Responsabilidades

| Integrante | Requisitos | Módulos | Participación |
|-----------|-----------|---------|---------------|
| **[Nombre 1]** | RF.1, RF.4 | Profesor, Scheduler | 33% |
| **[Nombre 2]** | RF.2, RF.5 | Alumno, Auth | 33% |
| **[Nombre 3]** | RF.3 | Secretaria, Vehículos | 34% |

**Nota**: Completar con nombres reales y distribución específica del equipo.

---

## ANEXO G: Cronograma de Desarrollo

| Fase | Duración | Hitos |
|------|----------|-------|
| **Análisis y Diseño** | 2 semanas | DER, Casos de uso, Prototipos |
| **Backend Base** | 3 semanas | Models, Controllers, Routes |
| **Frontend Base** | 3 semanas | Layouts, Componentes, Rutas |
| **Integraciones** | 2 semanas | API conectada, Autenticación |
| **Funcionalidades** | 3 semanas | Todos los RF implementados |
| **Testing y Ajustes** | 2 semanas | QA, Fixes, Optimización |
| **Documentación** | 1 semana | Informe final, Manuales |

---

## ANEXO H: Posibles Integraciones Futuras

1. **Pasarela de Pagos**: Webpay, Stripe
2. **Videoconferencias**: Zoom API, Jitsi
3. **Notificaciones**: SendGrid, Twilio
4. **Almacenamiento Cloud**: AWS S3
5. **Analytics**: Google Analytics, Mixpanel
6. **ERP Municipal**: APIs de municipalidades para exámenes

---

**Fin del Informe Técnico**

*Documento generado como parte del proyecto ISW 2026-1*  
*Ingeniería de Software II - Universidad del Bío Bío*  
*Fecha: 07 de Julio de 2026*

---

**RÚBRICA DE EVALUACIÓN ISW-2**

| Criterio | Escala |
|----------|--------|
| Relación con temática | 0-10 |
| Diferenciación vs sistemas genéricos | 0-10 |
| Cumplimiento de requisitos | 0-10 |
| Satisfacción de requerimientos | 0-10 |
| Distribución equitativa de trabajo | 0-10 |
| Organización (código + presentación) | 0-10 |
| Organización del equipo + conocimiento | 0-10 |
| Cantidad de código por integrante | 0-10 |
| Presentación clara del software | 0-10 |
| Conocimiento del código | 0-10 |
| Buenas prácticas de desarrollo | 0-10 |
| Calidad técnica general | 0-10 |
