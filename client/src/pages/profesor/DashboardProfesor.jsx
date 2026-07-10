import React, { useState, useEffect } from 'react';
import { Users, Calendar, Car, Clock, MapPin } from 'lucide-react';
import ProfesorLayout from '../../layouts/ProfesorLayout.jsx';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';
import MisClasesProfesor from './MisClasesProfesor.jsx';
import ClasesConfirmadasProfesor from './ClasesConfirmadasProfesor.jsx';
import RepositorioProfesor from './RepositorioProfesor.jsx';
import RegistrarAvanceProfesor from './RegistrarAvanceProfesor.jsx';
import MisClasesOnlineProfesor from './MisClasesOnlineProfesor.jsx';
import MisClasesConInscriptosProfesor from './MisClasesConInscriptosProfesor.jsx';
import EvaluacionPracticaProfesor from './EvaluacionPracticaProfesor.jsx';
import SolicitarVehiculo from "../../components/shared/SolicitarVehiculo.jsx";

const DashboardProfesor = () => {
  const [activeTab, setActiveTab] = useState("inicio");
  const [disponibilidadView, setDisponibilidadView] = useState("configurar"); // "configurar" o "verclases"
  const currentUser = authService.getCurrentUser();
  const profesorNombre = currentUser?.nombre || "Profesor";
  const profesorId = currentUser?.profesorId;

  const [alumnosCount, setAlumnosCount] = useState(0);
  const [clasesTodayCount, setClasesTodayCount] = useState(0);
  const [vehiculosCount, setVehiculosCount] = useState(0);
  const [clasesDelDia, setClasesDelDia] = useState([]);

  useEffect(() => {
    if (profesorId) {
      cargarDatos();
    }
  }, [profesorId]);

  const cargarDatos = async () => {
    try {
      const token = authService.getToken();

      // Cargar alumnos distintos inscritos
      const resAlumnos = await fetch(
        `http://localhost:5000/api/profesores/${profesorId}/alumnos-inscritos`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const dataAlumnos = await resAlumnos.json();
      setAlumnosCount(dataAlumnos.count || 0);

      // Cargar clases de hoy
      const resClasesHoy = await fetch(
        `http://localhost:5000/api/profesores/${profesorId}/clases-hoy`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const dataClasesHoy = await resClasesHoy.json();
      setClasesTodayCount(dataClasesHoy.count || 0);

      // Cargar detalle de clases del día
      const resClasesDetalle = await fetch(
        `http://localhost:5000/api/profesores/${profesorId}/clases-detalle-hoy`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const dataClasesDetalle = await resClasesDetalle.json();
      setClasesDelDia(dataClasesDetalle.clases || []);

      // Cargar vehículos reservados
      const resVehiculos = await fetch(
        `http://localhost:5000/api/profesores/${profesorId}/vehiculos-reservados`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const dataVehiculos = await resVehiculos.json();
      setVehiculosCount(dataVehiculos.count || 0);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    }
  };

  const stats = [
    { icon: Users, label: "Alumnos a cargo", value: String(alumnosCount), color: "#5a68d8" },
    { icon: Calendar, label: "Clases hoy", value: String(clasesTodayCount), color: "#6366f1" },
    { icon: Car, label: "Vehículos", value: String(vehiculosCount), color: "#06b6d4" },
  ];


  const tareasRapidas = [
    { id: 1, titulo: "Evaluaciones pendientes", icon: Calendar, count: 3 },
    { id: 2, titulo: "Programar clase", icon: Calendar },
    { id: 3, titulo: "Reservar vehículo", icon: Car },
  ];

  return (
    <ProfesorLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {/* INICIO TAB */}
      {activeTab === "inicio" && (
        <div>
          {/* Header */}
          <div style={{ marginBottom: spacing.margin.xlarge }}>
            <h2
              style={{
                fontSize: "42px",
                fontWeight: "bold",
                color: colors.textPrimary,
                margin: "0 0 8px 0",
              }}
            >
              Bienvenido, {profesorNombre}
            </h2>
            <p
              style={{
                color: colors.textTertiary,
                margin: 0,
                fontSize: "14px",
              }}
            >
              {new Date().toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* STATS CARDS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: spacing.gap.spacious,
              marginBottom: spacing.margin.xlarge,
            }}
          >
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  style={{
                    background: `linear-gradient(135deg, ${stat.color}80 0%, ${stat.color} 100%)`,
                    borderRadius: spacing.radius.lg,
                    padding: spacing.padding.xlarge,
                    color: colors.white,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: spacing.margin.md,
                    }}
                  >
                    <Icon size={32} opacity={0.8} />
                    <span style={{ fontSize: "32px", fontWeight: "bold" }}>
                      {stat.value}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CLASES DEL DÍA */}
          <Card title="Clases del día" icon={Clock} style={{ marginBottom: spacing.margin.xlarge }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: spacing.gap.normal,
              }}
            >
              {clasesDelDia.map((clase) => (
                <div
                  key={clase.id}
                  style={{
                    padding: spacing.padding.lg,
                    borderLeft: `4px solid ${colors.primary}`,
                    borderRadius: spacing.radius.md,
                    backgroundColor: colors.background,
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      colors.borderLight)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      colors.background)
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: spacing.margin.sm,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontWeight: "600",
                          fontSize: "16px",
                          color: colors.textPrimary,
                          margin: "0 0 4px 0",
                        }}
                      >
                        {clase.hora}
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          color: colors.textSecondary,
                          margin: 0,
                        }}
                      >
                        Alumno: <strong>{clase.alumno}</strong>
                      </p>
                    </div>
                    <span
                      style={{
                        padding: `6px 12px`,
                        borderRadius: spacing.radius.full,
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor:
                          clase.tipo_label === "teórica"
                            ? "#dbeafe"
                            : "#dcfce7",
                        color:
                          clase.tipo_label === "teórica"
                            ? "#1e40af"
                            : "#166534",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {clase.tipo} {clase.codigo}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: spacing.gap.tight,
                      color: colors.textSecondary,
                      fontSize: "13px",
                    }}
                  >
                    <MapPin size={16} />
                    <span>{clase.ubicacion}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* DISPONIBILIDAD TAB */}
      {activeTab === "disponibilidad" && (
        <div>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setDisponibilidadView("configurar")}
              style={{
                padding: '10px 20px',
                backgroundColor: disponibilidadView === "configurar" ? '#5a68d8' : '#e0e0e0',
                color: disponibilidadView === "configurar" ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: disponibilidadView === "configurar" ? 'bold' : 'normal',
              }}
            >
              ⚙️ Configurar disponibilidad
            </button>
            <button
              onClick={() => setDisponibilidadView("verclases")}
              style={{
                padding: '10px 20px',
                backgroundColor: disponibilidadView === "verclases" ? '#5a68d8' : '#e0e0e0',
                color: disponibilidadView === "verclases" ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: disponibilidadView === "verclases" ? 'bold' : 'normal',
              }}
            >
              📅 Ver clases online
            </button>
          </div>
          {disponibilidadView === "configurar" ? (
            <MisClasesProfesor />
          ) : (
            <MisClasesOnlineProfesor />
          )}
        </div>
      )}

      {/* REGISTRAR AVANCE TAB */}
      {activeTab === 'misclases' && (
        <RegistrarAvanceProfesor />
      )}
      {/* VEHÍCULOS TAB */}
      {activeTab === "vehiculos" && <SolicitarVehiculo userRole="profesor" />}

      {/* REPOSITORIO TAB */}
      {activeTab === "repositorio" && <RepositorioProfesor />}

      {/* EVALUACIÓN PRÁCTICA TAB */}
      {activeTab === "evaluacion" && <EvaluacionPracticaProfesor />}
    </ProfesorLayout>
  );
};
export default DashboardProfesor;
