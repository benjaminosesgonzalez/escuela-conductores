import React, { useState } from 'react';
import { BookOpen, Calendar, CheckCircle, Clock } from 'lucide-react';
import AlumnoLayout from '../../layouts/AlumnoLayout.jsx';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';
import ReservarClaseAlumno from './ReservarClaseAlumno.jsx';
import MisClasesAlumno from './MisClasesAlumno.jsx';
import ClasesOnlineDisponiblesAlumno from './ClasesOnlineDisponiblesAlumno.jsx';

const DashboardAlumno = () => {
  const [activeTab, setActiveTab] = useState('inicio');
  const [refreshMisClases, setRefreshMisClases] = useState(0);
  const currentUser = authService.getCurrentUser();
  const alumnoNombre = currentUser?.nombre || 'Alumno';

  const handleDesinscripcion = () => {
    // Trigger para refrescar "Mis clases"
    setRefreshMisClases(prev => prev + 1);
  };

  const stats = [
    { icon: BookOpen, label: 'Clases tomadas', value: '12', color: '#10b981' },
    { icon: Calendar, label: 'Próxima clase', value: 'Hoy', color: '#3b82f6' },
    { icon: CheckCircle, label: 'Completadas', value: '8', color: '#f59e0b' },
  ];

  const misClases = [
    {
      id: 1,
      fecha: 'Hoy - 9:00 am',
      profesor: 'Juan Pérez',
      tipo: 'Teórica',
      estado: 'próxima'
    },
    {
      id: 2,
      fecha: 'Mañana - 2:00 pm',
      profesor: 'María López',
      tipo: 'Práctica',
      estado: 'programada'
    },
    {
      id: 3,
      fecha: 'Viernes - 10:00 am',
      profesor: 'Carlos Rodríguez',
      tipo: 'Teórica',
      estado: 'programada'
    }
  ];

  return (
    <AlumnoLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {/* INICIO TAB */}
      {activeTab === 'inicio' && (
        <div>
          {/* Header */}
          <div style={{ marginBottom: spacing.margin.xlarge }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: colors.textPrimary,
              margin: '0 0 8px 0'
            }}>
              Bienvenido, {alumnoNombre}
            </h2>
            <p style={{
              color: colors.textTertiary,
              margin: 0,
              fontSize: '14px'
            }}>
              Tu progreso en la escuela de conductores
            </p>
          </div>

          {/* STATS CARDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: spacing.gap.spacious,
            marginBottom: spacing.margin.xlarge
          }}>
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
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: spacing.margin.md
                  }}>
                    <Icon size={32} opacity={0.8} />
                    <span style={{ fontSize: '28px', fontWeight: 'bold' }}>
                      {stat.value}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* MIS CLASES */}
          <Card title="Mis clases próximas" icon={Clock}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: spacing.gap.normal,
              marginBottom: spacing.margin.lg
            }}>
              {misClases.map((clase) => (
                <div
                  key={clase.id}
                  style={{
                    padding: spacing.padding.lg,
                    backgroundColor: colors.background,
                    borderRadius: spacing.radius.md,
                    borderLeft: `4px solid ${colors.alumno}`,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.borderLight}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.background}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start'
                  }}>
                    <div>
                      <p style={{
                        fontWeight: '600',
                        fontSize: '15px',
                        color: colors.textPrimary,
                        margin: '0 0 4px 0'
                      }}>
                        {clase.fecha}
                      </p>
                      <p style={{
                        fontSize: '13px',
                        color: colors.textSecondary,
                        margin: '0 0 4px 0'
                      }}>
                        Profesor: <strong>{clase.profesor}</strong>
                      </p>
                    </div>
                    <span style={{
                      padding: `6px 12px`,
                      borderRadius: spacing.radius.full,
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: clase.tipo === 'Teórica' ? '#dbeafe' : '#dcfce7',
                      color: clase.tipo === 'Teórica' ? '#1e40af' : '#166534'
                    }}>
                      {clase.tipo}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="success"
              fullWidth={true}
              onClick={() => { /* Navegar a reservar */ }}
            >
              Reservar más clases
            </Button>
          </Card>
        </div>
      )}

      {/* RESERVAR CLASE TAB */}
      {activeTab === 'reservar' && (
        <ReservarClaseAlumno />
      )}

      {/* MIS CLASES TAB */}
      {activeTab === 'misclases' && (
        <MisClasesAlumno refreshTrigger={refreshMisClases} />
      )}

      {/* RESERVAR CLASES ONLINE TAB */}
      {activeTab === 'clasesOnlineDisponibles' && (
        <ClasesOnlineDisponiblesAlumno onDesinscripcion={handleDesinscripcion} />
      )}

    </AlumnoLayout>
  );
};

export default DashboardAlumno;
