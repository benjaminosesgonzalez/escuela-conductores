import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, CheckCircle, Clock, MapPin } from 'lucide-react';
import AlumnoLayout from '../../layouts/AlumnoLayout.jsx';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';
import MisClasesAlumno from './MisClasesAlumno.jsx';
import ClasesOnlineDisponiblesAlumno from './ClasesOnlineDisponiblesAlumno.jsx';
import ClasesPracticasDisponiblesAlumno from './ClasesPracticasDisponiblesAlumno.jsx';
import SalaPsicotecnicaAlumno from "./SalaPsicotecnicaAlumno.jsx";
import SolicitarVehiculo from "../../components/shared/SolicitarVehiculo.jsx";
import MiAvanceAlumno from "./MiAvanceAlumno.jsx";

const DashboardAlumno = () => {
  const [activeTab, setActiveTab] = useState('inicio');
  const [refreshMisClases, setRefreshMisClases] = useState(0);
  const currentUser = authService.getCurrentUser();
  const alumnoNombre = currentUser?.nombre
    ? currentUser.nombre.charAt(0).toUpperCase() + currentUser.nombre.slice(1)
    : "Alumno";
  const alumnoId = currentUser?.alumnoId;
  const [clasesProximas, setClasesProximas] = useState([]);
  const [clasesInscritas, setClasesInscritas] = useState(0);
  const [proximaClase, setProximaClase] = useState("—");
  const [clasesCompletadas, setClasesCompletadas] = useState(0);

  useEffect(() => {
    if (alumnoId) {
      cargarDatos();
    }
  }, [alumnoId]);

  const cargarDatos = async () => {
    try {
      const token = authService.getToken();

      // Cargar clases próximas
      const resProximas = await fetch(
        `http://localhost:5000/api/alumnos/${alumnoId}/clases-proximas`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const dataProximas = await resProximas.json();
      setClasesProximas(dataProximas.clases || []);

      // Cargar estadísticas
      const resStats = await fetch(
        `http://localhost:5000/api/alumnos/${alumnoId}/estadisticas`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const dataStats = await resStats.json();
      setClasesInscritas(dataStats.clasesInscritas || 0);
      setProximaClase(dataStats.proximaClase || "—");
      setClasesCompletadas(dataStats.clasesCompletadas || 0);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const handleDesinscripcion = () => {
    // Trigger para refrescar "Mis clases"
    setRefreshMisClases(prev => prev + 1);
  };

  const stats = [
    { icon: BookOpen, label: "Clases tomadas", value: String(clasesInscritas), color: "#10b981" },
    { icon: Calendar, label: "Próxima clase", value: proximaClase, color: "#3b82f6" },
    { icon: CheckCircle, label: "Completadas", value: String(clasesCompletadas), color: "#f59e0b" },
  ];


  return (
    <AlumnoLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {/* INICIO TAB */}
      {activeTab === "inicio" && (
        <div>
          {/* Header */}
          <div style={{ marginBottom: spacing.margin.xlarge }}>
            <h2
              style={{
                fontSize: "40px",
                fontWeight: "bold",
                color: colors.textPrimary,
                margin: "0 0 8px 0",
              }}
            >
              Bienvenido, {alumnoNombre}
            </h2>
            <p
              style={{
                color: colors.textTertiary,
                margin: 0,
                fontSize: "18px",
              }}
            >
              Tu progreso en la escuela de conductores
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
                    <Icon size={36} opacity={0.8} />
                    <span style={{ fontSize: "32px", fontWeight: "bold" }}>
                      {stat.value}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "17px", opacity: 0.9 }}>
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* MIS CLASES */}
          <Card title="Mis clases próximas" icon={Clock}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: spacing.gap.normal,
                marginBottom: spacing.margin.lg,
              }}
            >
              {clasesProximas.map((clase) => (
                <div
                  key={clase.id}
                  style={{
                    padding: spacing.padding.lg,
                    backgroundColor: colors.background,
                    borderRadius: spacing.radius.md,
                    borderLeft: `4px solid ${colors.alumno}`,
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
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontWeight: "600",
                          fontSize: "19px",
                          color: colors.textPrimary,
                          margin: "0 0 4px 0",
                        }}
                      >
                        {clase.fecha}
                      </p>
                      <p
                        style={{
                          fontSize: "17px",
                          color: colors.textSecondary,
                          margin: "0 0 4px 0",
                        }}
                      >
                        Profesor: <strong>{clase.profesor}</strong>
                      </p>
                    </div>
                    <span
                      style={{
                        padding: `8px 16px`,
                        borderRadius: spacing.radius.md,
                        fontSize: "16px",
                        fontWeight: "600",
                        backgroundColor:
                          clase.tipo === "Teórica" ? "#dbeafe" : "#dcfce7",
                        color: clase.tipo === "Teórica" ? "#1e40af" : "#166534",
                      }}
                    >
                      {clase.tema || clase.tipo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* MIS CLASES TAB */}
      {activeTab === 'misclases' && (
        <MisClasesAlumno refreshTrigger={refreshMisClases} />
      )}

      {/* RESERVAR CLASES ONLINE TAB */}
      {activeTab === 'clasesOnlineDisponibles' && (
        <ClasesOnlineDisponiblesAlumno onDesinscripcion={handleDesinscripcion} />
      )}

      {/* RESERVAR CLASE PRACTICA TAB */}
      {activeTab === 'clasesPracticasDisponibles' && (
        <ClasesPracticasDisponiblesAlumno onDesinscripcion={handleDesinscripcion} />
      )}
      
      {/* MI AVANCE TAB */}
      {activeTab === "avance" && <MiAvanceAlumno />}

      {/* SALA PSICOTÉCNICA TAB */}
      {activeTab === "psicotecnico" && <SalaPsicotecnicaAlumno />}

      {/* VEHÍCULOS TAB */}
      {activeTab === "vehiculos" && <SolicitarVehiculo userRole="alumno" />}
    </AlumnoLayout>
  );
};

export default DashboardAlumno;
