import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, TrendingUp, UserPlus, Car, CalendarClock, Search, MapPin, Edit 
} from 'lucide-react';
import SecretariaLayout from '../../layouts/SecretariaLayout.jsx';
import AgendarClasesSecretaria from './AgendarClasesSecretaria.jsx';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';

// Arreglo estático de planes proporcionado (IDs ajustados a INT para coincidir con la base de datos)
const planesDisponibles = [
  {
    id: 1,
    nombre: 'Plan básico',
    precio: '$50.000',
    caracteristicas: ['✓ 4 clases totales', '✓ Curso teórico básico', '✓ 1 clase de simulador']
  },
  {
    id: 2,
    nombre: 'Plan intermedio',
    precio: '$100.000',
    caracteristicas: ['✓ 8 clases totales', '✓ Curso teórico intermedio', '✓ 2 clases de simulador']
  },
  {
    id: 3,
    nombre: 'Plan intensivo',
    precio: '$130.000',
    caracteristicas: ['✓ 12 clases totales', '✓ Curso teórico avanzado', '✓ 3 clases de simulador']
  }
];

const DashboardSecretaria = () => {
  const [activeTab, setActiveTab] = useState('inicio');
  const [vistaAlumno, setVistaAlumno] = useState('tabla'); 
  
  const [alumnos, setAlumnos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);
  const [alumnoEditando, setAlumnoEditando] = useState(null);

  const [statsData, setStatsData] = useState({
    totalAlumnos: 0,
    totalProfesores: 0,
    totalClases: 342
  });

  const [formData, setFormData] = useState({
    nombre: '', rut: '', email: '', telefono: '', sexo: '', comuna: '', id_plan_matriculado: ''
  });

  const currentUser = authService.getCurrentUser();
  const secretariaNombre = currentUser?.nombre || 'Secretaria';

  // Estilos de botones de Tareas Rápidas
  const btnActionStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.gap.large,
    width: '100%',
    padding: '24px', 
    backgroundColor: colors.white,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: spacing.radius.lg,
    color: colors.textPrimary,
    fontSize: '16px', 
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '24px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = authService.getToken();
        const headers = { 'Authorization': `Bearer ${token}` };

        // Ya no consultamos planes al backend, solo alumnos y profesores
        const [alumnosRes, profesRes] = await Promise.all([
          fetch('http://localhost:5000/api/alumnos', { headers }),
          fetch('http://localhost:5000/api/profesores', { headers })
        ]);

        const alumnosData = await alumnosRes.json();
        const profesData = await profesRes.json();

        if(alumnosData.success) {
          setAlumnos(alumnosData.data);
          setStatsData(prev => ({ ...prev, totalAlumnos: alumnosData.data.length }));
        }
        
        if(profesData.success) {
          setProfesores(profesData.data);
          setStatsData(prev => ({ ...prev, totalProfesores: profesData.data.length }));
        }

      } catch (error) {
        console.error("Error cargando la data del dashboard:", error);
      }
    };

    fetchDashboardData();
  }, []);

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

  const handleCrearAlumno = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/alumnos/registrar', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if(response.ok) {
        alert(data.message);
        setFormData({nombre: '', rut: '', email: '', telefono: '', sexo: '', comuna: '', id_plan_matriculado: ''});
        setVistaAlumno('tabla');
        
        const alumnosRes = await fetch('http://localhost:5000/api/alumnos', { headers: { 'Authorization': `Bearer ${authService.getToken()}` } });
        const alData = await alumnosRes.json();
        if(alData.success) {
          setAlumnos(alData.data);
          setStatsData(prev => ({ ...prev, totalAlumnos: alData.data.length }));
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditarAlumno = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/alumnos/editar/${alumnoEditando.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if(response.ok) {
        alert(data.message);
        setAlumnoEditando(null);
        setVistaAlumno('tabla');
        
        const alumnosRes = await fetch('http://localhost:5000/api/alumnos', { headers: { 'Authorization': `Bearer ${authService.getToken()}` } });
        const alData = await alumnosRes.json();
        if(alData.success) setAlumnos(alData.data);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAsignarSedeMasiva = async () => {
    if (alumnosSeleccionados.length === 0) return alert("Selecciona alumnos primero");
    const idSede = prompt("Ingresa el ID de la Sede a asignar:");
    
    if (!idSede) return;

    try {
      const response = await fetch('http://localhost:5000/api/alumnos/sede-alumno', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ alumnos_ids: alumnosSeleccionados, id_sede: parseInt(idSede) })
      });
      const data = await response.json();
      if(response.ok) {
        alert(data.message);
        setAlumnosSeleccionados([]);
        
        const alumnosRes = await fetch('http://localhost:5000/api/alumnos', { headers: { 'Authorization': `Bearer ${authService.getToken()}` } });
        const alData = await alumnosRes.json();
        if(alData.success) setAlumnos(alData.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderAlumnosView = () => {
    if (vistaAlumno === 'tabla') {
      return (
        <Card title="Directorio de Alumnos Registrados" icon={Users}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.margin.large }}>
            <div style={{ display: 'flex', gap: spacing.gap.normal, flex: 1, marginRight: '20px' }}>
              <input type="text" placeholder="Buscar por RUT o Nombre..." style={{ flex: 1, padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }} />
            </div>
            {alumnosSeleccionados.length > 0 && (
              <Button style={{ backgroundColor: colors.secretaria }} onClick={handleAsignarSedeMasiva}>
                Asignar Sede a ({alumnosSeleccionados.length}) Alumnos
              </Button>
            )}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${colors.borderLight}`, color: colors.textSecondary }}>
                <th style={{ padding: '12px' }}>Sel.</th>
                <th style={{ padding: '12px' }}>RUT</th>
                <th style={{ padding: '12px' }}>Nombre</th>
                <th style={{ padding: '12px' }}>Comuna</th>
                <th style={{ padding: '12px' }}>Sede</th>
                <th style={{ padding: '12px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: colors.textSecondary }}>Cargando datos o no hay alumnos registrados.</td></tr>
              ) : (
                alumnos.map((alum) => (
                  <tr key={alum.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                    <td style={{ padding: '12px' }}>
                      <input 
                        type="checkbox" 
                        checked={alumnosSeleccionados.includes(alum.id)}
                        onChange={(e) => {
                          if (e.target.checked) setAlumnosSeleccionados([...alumnosSeleccionados, alum.id]);
                          else setAlumnosSeleccionados(alumnosSeleccionados.filter(id => id !== alum.id));
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>{alum.rut}</td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{alum.nombre}</td>
                    <td style={{ padding: '12px' }}>{alum.comuna || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      {alum.id_sede ? (
                        <span style={{ color: colors.success }}>Sede #{alum.id_sede}</span>
                      ) : (
                        <span style={{ color: colors.error, fontSize: '12px', fontWeight: 'bold' }}>Sin sede</span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => {
                          setAlumnoEditando(alum);
                          setFormData({ ...alum, email: alum.user?.email || '' });
                          setVistaAlumno('editar');
                        }} 
                        style={{ cursor: 'pointer', border: 'none', background: 'none', color: colors.secretaria }}>
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      );
    }

    if (vistaAlumno === 'crear' || vistaAlumno === 'editar') {
      const isEdit = vistaAlumno === 'editar';
      return (
        <Card title={isEdit ? "Editar Datos del Alumno" : "Ingresar Nuevo Alumno"} icon={isEdit ? Edit : UserPlus}>
          <form onSubmit={isEdit ? handleEditarAlumno : handleCrearAlumno} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.gap.large }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>Nombre Completo</label>
              <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}/>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>RUT {isEdit && "(No editable)"}</label>
              <input required type="text" disabled={isEdit} value={formData.rut} onChange={e => setFormData({...formData, rut: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}/>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>Email</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}/>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>Teléfono</label>
              <input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}/>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>Sexo</label>
              <select value={formData.sexo} onChange={e => setFormData({...formData, sexo: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}>
                <option value="">Seleccione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>Comuna</label>
              <input type="text" value={formData.comuna} onChange={e => setFormData({...formData, comuna: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}/>
            </div>

            {!isEdit && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                <label>Plan a Matricular</label>
                <select 
                  required 
                  value={formData.id_plan_matriculado} 
                  onChange={e => setFormData({...formData, id_plan_matriculado: Number(e.target.value)})} 
                  style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}`, backgroundColor: colors.white }}
                >
                  <option value="">Seleccione un plan...</option>
                  {planesDisponibles.map(plan => (
                     <option key={plan.id} value={plan.id}>
                       {plan.nombre} - {plan.precio} ({plan.caracteristicas[0].replace('✓ ', '')})
                     </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '20px' }}>
              <Button type="submit" style={{ backgroundColor: colors.secretaria }}>
                {isEdit ? 'Guardar Cambios' : 'Registrar y Matricular'}
              </Button>
              <Button type="button" onClick={() => setVistaAlumno('tabla')} style={{ backgroundColor: '#64748b' }}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      );
    }
  };

  return (
    <SecretariaLayout activeTab={activeTab} onTabChange={setActiveTab}>
      
      {activeTab === 'inicio' && (
        <div>
          <div style={{ marginBottom: spacing.margin.xlarge }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: colors.textPrimary,
              margin: '0 0 8px 0'
            }}>
              Panel de Control - {secretariaNombre}
            </h2>
            <p style={{
              color: colors.textTertiary,
              margin: 0,
              fontSize: '14px'
            }}>
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
                onClick={() => { setActiveTab('alumnos'); setVistaAlumno('crear'); }}
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

              <button 
                style={btnActionStyle}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.secretaria + '15'; e.currentTarget.style.borderColor = colors.secretaria; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.white; e.currentTarget.style.borderColor = colors.borderLight; }}
              >
                <CalendarClock size={20} color={colors.secretaria} />
                Asignar horas de clase
              </button>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'alumnos' && (
        <div>
          <div style={{ display: 'flex', gap: spacing.gap.normal, marginBottom: spacing.margin.large }}>
            <Button onClick={() => setVistaAlumno('tabla')} style={{ backgroundColor: vistaAlumno === 'tabla' ? colors.secretaria : colors.background, color: vistaAlumno === 'tabla' ? 'white' : colors.textPrimary }}>
              📋 Ver Tabla de Alumnos
            </Button>
            <Button onClick={() => { setFormData({nombre: '', rut: '', email: '', telefono: '', sexo: '', comuna: '', id_plan_matriculado: ''}); setVistaAlumno('crear'); }} style={{ backgroundColor: vistaAlumno === 'crear' ? colors.secretaria : colors.background, color: vistaAlumno === 'crear' ? 'white' : colors.textPrimary }}>
              ➕ Ingresar Alumno Nuevo
            </Button>
          </div>
          
          {renderAlumnosView()}
        </div>
      )}

      {(activeTab === 'profesores' || activeTab === 'psicotecnico' || activeTab === 'vehiculos' || activeTab === 'reportes' || activeTab === 'configuracion') && (
        <Card title={activeTab.toUpperCase()} icon={FileText}>
          <p style={{ color: colors.textSecondary, textAlign: 'center', padding: spacing.padding.xlarge }}>
            Módulo en desarrollo
          </p>
        </Card>
      )}

      {/* AGENDAR CLASES TAB */}
      {activeTab === 'agendar-clases' && (
        <AgendarClasesSecretaria />
      )}

      {/* REPORTES TAB */}
      {activeTab === 'reportes' && (
        <Card title="Reportes" icon={FileText}>
          <p style={{
            color: colors.textSecondary,
            textAlign: 'center',
            padding: spacing.padding.xlarge
          }}>
            Módulo de reportes en desarrollo
          </p>
        </Card>
      )}
    </SecretariaLayout>
  );
};

export default DashboardSecretaria;