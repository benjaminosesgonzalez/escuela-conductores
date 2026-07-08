import React, { useState } from "react";
import { Users, Calendar, Car, Clock, MapPin } from "lucide-react";
import ProfesorLayout from "../../layouts/ProfesorLayout.jsx";
import { Card, Button } from "../../components/shared/index.js";
import { colors, spacing } from "../../theme/index.js";
import { authService } from "../../services/authService.js";
import MisClasesProfesor from "./MisClasesProfesor.jsx";
import ClasesConfirmadasProfesor from "./ClasesConfirmadasProfesor.jsx";
import RepositorioProfesor from "./RepositorioProfesor.jsx";
import SolicitarVehiculo from "../../components/shared/SolicitarVehiculo.jsx";

const DashboardProfesor = () => {
  const [activeTab, setActiveTab] = useState("inicio");
  const currentUser = authService.getCurrentUser();
  const profesorNombre = currentUser?.nombre || "Profesor";

  const stats = [
    { icon: Users, label: "Alumnos a cargo", value: "9", color: "#5a68d8" },
    { icon: Calendar, label: "Clases hoy", value: "4", color: "#6366f1" },
    { icon: Car, label: "Vehículos", value: "2", color: "#06b6d4" },
  ];

  const clases = [
    {
      id: 1,
      hora: "9:00 am - 9:30 am",
      alumno: "Carlos Silva",
      tipo: "Teórica",
      codigo: "S03",
      ubicacion: "Zoom",
      tipo_label: "teórica",
    },
    {
      id: 2,
      hora: "12:00 pm - 12:30 pm",
      alumno: "Andres Ruiz",
      tipo: "Teórica",
      codigo: "S04",
      ubicacion: "Zoom",
      tipo_label: "teórica",
    },
    {
      id: 3,
      hora: "13:30 pm - 14:30 pm",
      alumno: "Pablo López",
      tipo: "Práctica",
      codigo: "1",
      ubicacion: "San Pedro",
      tipo_label: "práctica",
    },
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

          {/* CLASES Y TAREAS - LADO A LADO */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: spacing.gap.spacious,
              marginBottom: spacing.margin.xlarge,
              "@media (max-width: 1024px)": {
                gridTemplateColumns: "1fr",
              },
            }}
          >
            {/* CLASES DEL DÍA */}
            <Card title="Clases del día" icon={Clock}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing.gap.normal,
                }}
              >
                {clases.map((clase) => (
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

            {/* TAREAS RÁPIDAS */}
            <Card title="Tareas rápidas" icon={Calendar}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: spacing.gap.normal,
                }}
              >
                {tareasRapidas.map((tarea) => {
                  const TareaIcon = tarea.icon;
                  return (
                    <div
                      key={tarea.id}
                      style={{
                        padding: spacing.padding.lg,
                        backgroundColor: colors.background,
                        borderRadius: spacing.radius.md,
                        borderLeft: `4px solid ${colors.primary}`,
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          colors.borderLight;
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          colors.background;
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: spacing.margin.sm,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: spacing.gap.normal,
                          }}
                        >
                          <TareaIcon size={20} color={colors.primary} />
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: colors.textPrimary,
                              margin: 0,
                            }}
                          >
                            {tarea.titulo}
                          </p>
                        </div>
                        {tarea.count !== undefined && (
                          <p
                            style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                              color: colors.primary,
                              margin: 0,
                            }}
                          >
                            {tarea.count}
                          </p>
                        )}
                      </div>

                      <Button variant="primary" size="sm" fullWidth={true}>
                        {tarea.id === 1
                          ? "Ver"
                          : tarea.id === 2
                            ? "Agendar"
                            : "Reservar"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* PRÓXIMA CLASE */}
          <Card
            style={{
              borderLeft: `4px solid ${colors.warning}`,
              backgroundColor: `${colors.warning}10`,
            }}
          >
            <h4
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: colors.textPrimary,
                margin: "0 0 12px 0",
              }}
            >
              ⏰ Próxima clase
            </h4>
            <p
              style={{
                fontSize: "13px",
                color: colors.textSecondary,
                margin: "0 0 16px 0",
                lineHeight: "1.5",
              }}
            >
              Carlos Silva en 2 horas - Teórica S03 (Zoom)
            </p>
            <Button variant="warning">Recordatorio en 30 min</Button>
          </Card>
        </div>
      )}

      {/* DISPONIBILIDAD TAB */}
      {activeTab === "disponibilidad" && <MisClasesProfesor />}

      {/* MIS CLASES TAB */}
      {activeTab === "misclases" && <ClasesConfirmadasProfesor />}

      {/* VEHÍCULOS TAB */}
      {activeTab === "vehiculos" && <SolicitarVehiculo userRole="profesor" />}

      {/* REPOSITORIO TAB */}
      {activeTab === "repositorio" && <RepositorioProfesor />}

      {/* VEHÍCULOS Y SOLICITUDES TAB */}
      {activeTab === "vehiculos" && <VehiculosYSolicitudes />}
    </ProfesorLayout>
  );
};
export default DashboardProfesor;
