import { useState } from "react";
import { Users, FileText, TrendingUp } from "lucide-react";
import SecretariaLayout from "../../layouts/SecretariaLayout.jsx";
import AgendarClasesSecretaria from "./AgendarClasesSecretaria.jsx";
import Interesados from "./Interesados.jsx";
import { Card } from "../../components/shared/index.js";
import { colors, spacing } from "../../theme/index.js";
import { authService } from "../../services/authService.js";
import VehiculosYSolicitudes from "../autos.jsx";

const DashboardSecretaria = () => {
  const [activeTab, setActiveTab] = useState("inicio");
  const currentUser = authService.getCurrentUser();
  const secretariaNombre = currentUser?.nombre || "Secretaria";

  const stats = [
    {
      icon: Users,
      label: "Alumnos registrados",
      value: "145",
      color: "#3b82f6",
    },
    { icon: Users, label: "Profesores activos", value: "8", color: "#10b981" },
    {
      icon: TrendingUp,
      label: "Clases completadas",
      value: "342",
      color: "#f59e0b",
    },
  ];

  const actividadReciente = [
    {
      id: 1,
      tipo: "alumno",
      nombre: "Juan García",
      accion: "se registró",
      fecha: "Hace 2 horas",
    },
    {
      id: 2,
      tipo: "clase",
      nombre: "Clase Teórica",
      accion: "fue completada por",
      fecha: "Hace 1 hora",
      profesor: "María López",
    },
    {
      id: 3,
      tipo: "alumno",
      nombre: "Carlos Silva",
      accion: "reservó una clase",
      fecha: "Hace 30 minutos",
    },
    {
      id: 4,
      tipo: "profesor",
      nombre: "Juan Pérez",
      accion: "actualizó su disponibilidad",
      fecha: "Hace 15 minutos",
    },
  ];

  return (
    <SecretariaLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {/* INICIO TAB */}
      {activeTab === "inicio" && (
        <div>
          {/* Header */}
          <div style={{ marginBottom: spacing.margin.xlarge }}>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                color: colors.textPrimary,
                margin: "0 0 8px 0",
              }}
            >
              Panel de Control - {secretariaNombre}
            </h2>
            <p
              style={{
                color: colors.textTertiary,
                margin: 0,
                fontSize: "14px",
              }}
            >
              Gestión de la escuela de conductores
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

          {/* ACTIVIDAD RECIENTE */}
          <Card title="Actividad reciente" icon={FileText}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: spacing.gap.normal,
              }}
            >
              {actividadReciente.map((evento) => (
                <div
                  key={evento.id}
                  style={{
                    padding: spacing.padding.lg,
                    backgroundColor: colors.background,
                    borderRadius: spacing.radius.md,
                    borderLeft: `4px solid ${colors.secretaria}`,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = colors.borderLight)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = colors.background)
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontWeight: "600",
                          fontSize: "15px",
                          color: colors.textPrimary,
                          margin: "0 0 4px 0",
                        }}
                      >
                        {evento.nombre} {evento.accion}
                        {evento.profesor && <span> {evento.profesor}</span>}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: colors.textTertiary,
                          margin: 0,
                        }}
                      >
                        {evento.fecha}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: `6px 12px`,
                        borderRadius: spacing.radius.full,
                        fontSize: "11px",
                        fontWeight: "600",
                        backgroundColor:
                          evento.tipo === "alumno"
                            ? "#dbeafe"
                            : evento.tipo === "profesor"
                              ? "#dcfce7"
                              : "#fef3c7",
                        color:
                          evento.tipo === "alumno"
                            ? "#1e40af"
                            : evento.tipo === "profesor"
                              ? "#166534"
                              : "#92400e",
                        textTransform: "capitalize",
                      }}
                    >
                      {evento.tipo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ALUMNOS TAB */}
      {activeTab === "alumnos" && (
        <Card title="Gestión de alumnos" icon={Users}>
          <p
            style={{
              color: colors.textSecondary,
              textAlign: "center",
              padding: spacing.padding.xlarge,
            }}
          >
            Módulo de gestión de alumnos en desarrollo
          </p>
        </Card>
      )}

      {/* AGENDAR CLASES TAB */}
      {activeTab === "agendar-clases" && <AgendarClasesSecretaria />}

      {/* REPORTES TAB */}
      {activeTab === "reportes" && (
        <Card title="Reportes" icon={FileText}>
          <p
            style={{
              color: colors.textSecondary,
              textAlign: "center",
              padding: spacing.padding.xlarge,
            }}
          >
            Módulo de reportes en desarrollo
          </p>
        </Card>
      )}
      {/* VEHÍCULOS Y SOLICITUDES TAB */}
      {activeTab === "vehiculos-solicitudes" && <VehiculosYSolicitudes />}
      {activeTab === "interesados" && <Interesados />}
    </SecretariaLayout>
  );
};

export default DashboardSecretaria;
