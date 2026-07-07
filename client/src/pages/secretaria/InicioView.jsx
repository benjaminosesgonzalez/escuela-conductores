import React from 'react';
import { Users, TrendingUp, FileText, CalendarClock, UserPlus, Car } from 'lucide-react';
import { Card } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';

const InicioView = ({ secretariaNombre, statsData, setActiveTab }) => {
  const stats = [
    { icon: Users, label: 'Alumnos registrados', value: statsData.totalAlumnos, color: '#3b82f6' },
    { icon: Users, label: 'Profesores activos', value: statsData.totalProfesores, color: '#10b981' },
    { icon: TrendingUp, label: 'Clases completadas', value: statsData.totalClases, color: '#f59e0b' },
  ];

  const actividadReciente = [
    { id: 1, tipo: 'alumno', nombre: 'Juan García', accion: 'se registró', fecha: 'Hace 2 horas' },
    { id: 2, tipo: 'clase', nombre: 'Clase Teórica', accion: 'fue completada por', fecha: 'Hace 1 hora', profesor: 'María López' },
    { id: 3, tipo: 'alumno', nombre: 'Carlos Silva', accion: 'reservó una clase', fecha: 'Hace 30 minutos' },
  ];

  const btnActionStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing.gap.large,
    width: '100%', padding: '24px', backgroundColor: colors.white, border: `1px solid ${colors.borderLight}`,
    borderRadius: spacing.radius.lg, color: colors.textPrimary, fontSize: '16px', fontWeight: '600',
    cursor: 'pointer', transition: 'all 0.2s ease', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
  };

  return (
    <div>
      <div style={{ marginBottom: spacing.margin.xlarge }}>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: colors.textPrimary, margin: '0 0 8px 0' }}>
          Panel de Control - {secretariaNombre}
        </h2>
        <p style={{ color: colors.textTertiary, margin: 0, fontSize: '14px' }}>
          Gestión de la escuela de conductores
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: spacing.gap.spacious, marginBottom: spacing.margin.xlarge }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} style={{ background: `linear-gradient(135deg, ${stat.color}80 0%, ${stat.color} 100%)`, borderRadius: spacing.radius.lg, padding: spacing.padding.xlarge, color: colors.white, cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.margin.md }}>
                <Icon size={32} opacity={0.8} />
                <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{stat.value}</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.gap.spacious }}>
        <Card title="Actividad reciente" icon={FileText}>
          <div style={{ display: 'grid', gap: spacing.gap.normal }}>
            {actividadReciente.map((evento) => (
              <div key={evento.id} style={{ padding: spacing.padding.lg, backgroundColor: colors.background, borderRadius: spacing.radius.md, borderLeft: `4px solid ${colors.secretaria}`, transition: 'all 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.borderLight} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.background}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '15px', color: colors.textPrimary, margin: '0 0 4px 0' }}>{evento.nombre} {evento.accion} {evento.profesor && <span> {evento.profesor}</span>}</p>
                    <p style={{ fontSize: '12px', color: colors.textTertiary, margin: 0 }}>{evento.fecha}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Tareas Rápidas" icon={CalendarClock}>
          <button 
            style={btnActionStyle}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.secretaria + '15'; e.currentTarget.style.borderColor = colors.secretaria; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.white; e.currentTarget.style.borderColor = colors.borderLight; }}
            onClick={() => setActiveTab('alumnos')}
          >
            <UserPlus size={20} color={colors.secretaria} />
            Ingresar alumno nuevo
          </button>
          <button 
            style={btnActionStyle}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.secretaria + '15'; e.currentTarget.style.borderColor = colors.secretaria; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.white; e.currentTarget.style.borderColor = colors.borderLight; }}
          >
            <Car size={20} color={colors.secretaria} />
            Reservas de Vehículos
          </button>
        </Card>
      </div>
    </div>
  );
};

export default InicioView;