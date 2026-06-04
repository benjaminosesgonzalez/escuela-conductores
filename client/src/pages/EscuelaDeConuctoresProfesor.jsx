import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, Car, Menu, X, Video, Clock, MapPin, CheckSquare, Bell, LogOut } from 'lucide-react';
import { authService } from '../services/authService';

export default function DashboardProfesor() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('inicio');

  const currentUser = authService.getCurrentUser();
  const profesorNombre = currentUser?.email || "Profesor";

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const stats = [
    { icon: Users, label: 'Alumnos a cargo', value: '9', color: '#5a68d8' },
    { icon: Calendar, label: 'Clases programadas hoy', value: '4', color: '#6366f1' },
    { icon: Car, label: 'Vehículos asignados', value: '2', color: '#06b6d4' },
  ];

  const clases = [
    {
      id: 1,
      hora: '9:00 am - 9:30 am',
      alumno: 'Carlos Silva',
      tipo: 'Teórica',
      codigo: 'S03',
      ubicacion: 'Vía Zoom',
      tipo_label: 'teórica'
    },
    {
      id: 2,
      hora: '12:00 pm - 12:30 pm',
      alumno: 'Andres Ruiz',
      tipo: 'Teórica',
      codigo: 'S04',
      ubicacion: 'Vía Zoom',
      tipo_label: 'teórica'
    },
    {
      id: 3,
      hora: '13:30 pm - 14:30 pm',
      alumno: 'Pablo López',
      tipo: 'Práctica',
      codigo: '1',
      ubicacion: 'San Pedro',
      tipo_label: 'práctica'
    }
  ];

  const tareasRapidas = [
    { id: 1, titulo: 'Evaluaciones pendientes', icon: CheckSquare, count: 3 },
    { id: 2, titulo: 'Programar clase', icon: Calendar },
    { id: 3, titulo: 'Reservar vehículo', icon: Car }
  ];

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'alumnos', label: 'Alumnos', icon: Users },
    { id: 'clases', label: 'Mis clases', icon: Calendar },
    { id: 'evaluacion', label: 'Evaluación práctica', icon: Car }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* SIDEBAR */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: sidebarOpen ? '280px' : '80px',
        backgroundColor: '#7d88d1',
        color: 'white',
        transition: 'width 0.3s ease',
        overflowY: 'auto',
        zIndex: 50,
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        
        {/* Header Sidebar */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'white',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Car size={24} color="#7d88d1" />
          </div>
          {sidebarOpen && <span style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>PROFESOR</span>}
        </div>

        {/* Menu Items */}
        <nav style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === item.id ? 'white' : 'transparent',
                  color: activeTab === item.id ? '#7d88d1' : 'rgba(255,255,255,0.8)',
                  fontWeight: activeTab === item.id ? '600' : '500',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          marginTop: 'auto'
        }}>
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              width: '100%',
              fontWeight: '500'
            }}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Salir</span>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ marginLeft: sidebarOpen ? '280px' : '80px', flex: 1, transition: 'margin-left 0.3s ease' }}>
        
        {/* TOP NAVBAR */}
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e0e0e0',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#7d88d1',
              margin: 0
            }}>
              ESCUELA DE CONDUCTORES
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <Bell size={24} color="#666" />
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                backgroundColor: '#ef4444',
                borderRadius: '50%'
              }}></span>
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '24px', borderLeft: '1px solid #e0e0e0' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#333', margin: 0 }}>
                  {profesorNombre.split('@')[0]}
                </p>
                <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Profesor</p>
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#7d88d1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                {profesorNombre.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <div style={{ padding: '32px' }}>
          
          {/* Bienvenida */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#333',
              margin: '0 0 8px 0'
            }}>
              Bienvenido, <span style={{ color: '#7d88d1' }}>{profesorNombre.split('@')[0]}</span>
            </h2>
            <p style={{ color: '#999', margin: 0, fontSize: '14px' }}>15 de abril de 2024</p>
          </div>

          {/* STATS CARDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  style={{
                    background: `linear-gradient(135deg, ${stat.color}80 0%, ${stat.color} 100%)`,
                    borderRadius: '12px',
                    padding: '24px',
                    color: 'white',
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <Icon size={32} opacity={0.8} />
                    <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{stat.value}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* CLASES Y TAREAS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px'
          }}>
            
            {/* CLASES DEL DÍA */}
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '16px 24px',
                  borderBottom: '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Clock size={20} color="#7d88d1" />
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>
                    Clases del día
                  </h3>
                </div>

                <div>
                  {clases.map((clase) => (
                    <div
                      key={clase.id}
                      style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #f0f0f0',
                        borderLeft: '4px solid #7d88d1',
                        transition: 'background-color 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', alignItems: 'start', marginBottom: '12px' }}>
                        <div>
                          <p style={{ fontWeight: '600', fontSize: '16px', color: '#333', margin: '0 0 4px 0' }}>
                            {clase.hora}
                          </p>
                          <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
                            Alumno: <span style={{ color: '#333', fontWeight: '500' }}>{clase.alumno}</span>
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: clase.tipo_label === 'teórica' ? '#dbeafe' : '#dcfce7',
                            color: clase.tipo_label === 'teórica' ? '#1e40af' : '#166534'
                          }}>
                            {clase.tipo} {clase.codigo}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '13px', marginBottom: '12px' }}>
                        <MapPin size={16} />
                        <span>{clase.ubicacion}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{
                          padding: '8px 16px',
                          backgroundColor: '#7d88d1',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6b79c4'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7d88d1'}
                        >
                          <Video size={16} />
                          Unirse
                        </button>
                        <button style={{
                          padding: '8px 16px',
                          backgroundColor: '#f0f0f0',
                          color: '#333',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e8e8e8'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                        >
                          Información
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  padding: '16px 24px',
                  backgroundColor: '#f8f9fa',
                  borderTop: '1px solid #e0e0e0'
                }}>
                  <button style={{
                    width: '100%',
                    padding: '12px',
                    color: '#7d88d1',
                    fontWeight: '600',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(125,136,209,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Ver todos →
                  </button>
                </div>
              </div>
            </div>

            {/* TAREAS RÁPIDAS */}
            <div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '16px 24px',
                  borderBottom: '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckSquare size={20} color="#7d88d1" />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' }}>
                    Tareas rápidas
                  </h3>
                </div>

                <div>
                  {tareasRapidas.map((tarea) => {
                    const Icon = tarea.icon;
                    return (
                      <div
                        key={tarea.id}
                        style={{
                          padding: '20px 24px',
                          borderBottom: '1px solid #f0f0f0',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                          <div style={{
                            padding: '8px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Icon size={18} color="#7d88d1" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: '600', fontSize: '14px', color: '#333', margin: 0 }}>
                              {tarea.titulo}
                            </p>
                            {tarea.count !== undefined && (
                              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#7d88d1', margin: '4px 0 0 0' }}>
                                {tarea.count}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <button style={{
                          width: '100%',
                          padding: '8px',
                          backgroundColor: '#7d88d1',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6b79c4'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7d88d1'}
                        >
                          {tarea.id === 1 ? 'Ver' : tarea.id === 2 ? 'Agendar' : 'Reservar'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Próxima clase */}
              <div style={{
                marginTop: '24px',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #fecaca'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#333', margin: '0 0 12px 0' }}>
                  ⏰ Próxima clase
                </h4>
                <p style={{ fontSize: '13px', color: '#666', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                  Carlos Silva en 2 horas - Teórica S03 (Zoom)
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{
                    flex: 1,
                    padding: '8px 12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Recordatorio en
                  </div>
                  <button style={{
                    padding: '8px 16px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
                  >
                    30 min
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
