import React, { useState } from 'react';
import Login from './Login.jsx';

const EscuelaLandingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('intermedio');
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing');

  if (currentPage === 'login') {
    return <Login onBack={() => setCurrentPage('landing')} />;
  }

  const plans = [
    {
      id: 'basico',
      nombre: 'Plan\nbásico',
      precio: '$50.000',
      caracteristicas: [
        '✓ 4 clases totales',
        '✓ Curso teórico básico',
        '✓ 1 clase de simulador'
      ]
    },
    {
      id: 'intermedio',
      nombre: 'Plan\nintermedio',
      precio: '$90.000',
      caracteristicas: [
        '✓ 8 clases totales',
        '✓ Curso teórico intermedio',
        '✓ 2 clases de simulador'
      ]
    },
    {
      id: 'intensivo',
      nombre: 'Plan\nintensivo',
      precio: '$130.000',
      caracteristicas: [
        '✓ 12 clases totales',
        '✓ Curso teórico avanzado',
        '✓ 3 clases de simulador'
      ]
    }
  ];

  const getCardStyle = (planId) => ({
    backgroundColor: selectedPlan === planId ? '#ff6b35' : '#3c47a1',
    padding: '24px 20px',
    borderRadius: '16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: selectedPlan === planId
      ? 'scale(1.03)'
      : hoveredPlan === planId
        ? 'translateY(-4px)'
        : 'scale(1)',
    boxShadow: selectedPlan === planId
      ? '0 8px 24px rgba(255, 107, 53, 0.3)'
      : hoveredPlan === planId
        ? '0 4px 16px rgba(0,0,0,0.15)'
        : 'none',
    border: selectedPlan === planId ? '2px solid rgba(255,255,255,0.3)' : 'none'
  });

  return (
    <div style={{
      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
      backgroundColor: '#e8ecf7',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .action-btn {
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .action-btn:active {
          transform: translateY(0);
        }

        @media (max-width: 1024px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header con logo y botones */}
      <div style={{
        backgroundColor: '#8793d8',
        padding: '24px 60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{
          backgroundColor: '#4c5fd5',
          color: 'white',
          padding: '14px 28px',
          borderRadius: '10px',
          fontWeight: 'bold',
          fontSize: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          ESCUELA DE CONDUCTORES
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            className="action-btn"
            onClick={() => setCurrentPage('login')}
            style={{
              backgroundColor: '#5a68d8',
              color: 'white',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            Iniciar sesión
          </button>

          <button
            className="action-btn"
            style={{
              backgroundColor: '#ff6b35',
              color: 'white',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            Registrarse
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{
        backgroundColor: '#d5dce8',
        padding: '30px 60px',
        flex: 1,
        width: '100%'
      }}>
        <div className="main-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          width: '100%'
        }}>
          {/* Sección izquierda */}
          <div>
            <section style={{ marginBottom: '30px' }}>
              <h1 style={{
                color: '#2c3e8f',
                fontSize: '50px',
                fontWeight: '700',
                margin: '0 0 20px 0',
                lineHeight: '1.2',
                letterSpacing: '-0.5px'
              }}>
                ¡Bienvenido a nuestra Escuela de Conductores!
              </h1>

              <h2 style={{
                color: '#2c3e8f',
                fontSize: '22px',
                fontWeight: '700',
                margin: '0 0 14px 0'
              }}>
                ¿Por qué elegirnos?
              </h2>

              <p style={{
                color: '#2c3e8f',
                fontSize: '22px',
                lineHeight: '1.4',
                margin: '0'
              }}>
                Te preparamos para conducir de manera <strong>segura</strong> y responsable, ofreciendo cursos teóricos y prácticos adaptados a tus necesidades.
              </p>
            </section>

            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '30px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
              backgroundColor: 'white'
            }}>
              <img
                src="https://i.imgur.com/GXsbTIp.png"
                alt="Instructor enseñando"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            <section style={{ marginBottom: '0px' }}>
              <h3 style={{
                color: '#2c3e8f',
                fontSize: '22px',
                fontWeight: '700',
                margin: '0 0 14px 0'
              }}>
                Quiénes somos
              </h3>

              <p style={{
                color: '#2c3e8f',
                fontSize: '22px',
                lineHeight: '1.4',
                margin: '0',
                textAlign: 'justify'
              }}>
                Somos una escuela de conductores con <strong> años de experiencia</strong> formando conductores responsables y seguros. Contamos con instructores certificados, vehículos modernos y flexibilidad de horarios para adaptarnos a tus necesidades. Aprende a conducir con nosotros y obtén tu licencia de conducir con confianza.
              </p>
            </section>
          </div>

          {/* Sección derecha - Planes */}
          <div>
            <div style={{
              backgroundColor: '#7d88d1',
              margin: '16px 0 0 0',
              padding: '60px 36px',
              borderRadius: '30px',
              color: 'white',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
            }}>
              <h2 style={{
                textAlign: 'center',
                fontSize: '28px',
                fontWeight: '750',
                margin: '0px 0 30px 0',
                padding: '4px 0px',
                letterSpacing: '-0.3px'
              }}>
                Elige tu plan de conducción
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginBottom: '24px'
              }}>
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    onMouseEnter={() => setHoveredPlan(plan.id)}
                    onMouseLeave={() => setHoveredPlan(null)}
                    style={getCardStyle(plan.id)}
                  >
                    <h3 style={{
                      fontSize: '17px',
                      fontWeight: '700',
                      margin: '0 0 16px 0',
                      color: 'white',
                      whiteSpace: 'pre-line',
                      lineHeight: '1.3'
                    }}>
                      {plan.nombre}
                    </h3>

                    <div style={{ fontSize: '32px', marginBottom: '18px' }}>🚗</div>

                    <div style={{
                      backgroundColor: selectedPlan === plan.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '40px'
                    }}>
                      <p style={{
                        fontSize: '26px',
                        fontWeight: '700',
                        margin: '0',
                        color: 'white'
                      }}>
                        {plan.precio}
                      </p>
                    </div>

                    <ul style={{
                      textAlign: 'left',
                      fontSize: '14px',
                      margin: '0',
                      padding: '0',
                      listStyle: 'none',
                      lineHeight: '1.8',
                      color: 'white'
                    }}>
                      {plan.caracteristicas.map((char, idx) => (
                        <li key={idx} style={{ marginBottom: '12px' }}>
                          {char}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                {plans.map((plan) => (
                  <button
                    key={`btn-${plan.id}`}
                    onClick={() => setSelectedPlan(plan.id)}
                    className="action-btn"
                    style={{
                      backgroundColor: selectedPlan === plan.id ? '#ff6b35' : '#4c5fd5',
                      color: 'white',
                      border: 'none',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Elegir plan
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#d5dce8',
        padding: '28px 60px',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        width: '100%'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '32px',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#2c3e8f',
              fontWeight: '700',
              fontSize: '15px'
            }}>
              <span>✓</span>
              <span>Clases prácticas y teóricas</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#2c3e8f',
              fontWeight: '700',
              fontSize: '15px'
            }}>
              <span>📅</span>
              <span>Horarios flexibles y certificados</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{
              color: '#2c3e8f',
              fontWeight: '700',
              margin: '0 0 6px 0',
              fontSize: '15px'
            }}>
              ¿Tienes preguntas? Habla con nosotros por
            </p>

            <p style={{
              color: '#2c3e8f',
              fontWeight: '700',
              margin: '0',
              fontSize: '15px'
            }}>
              💬 Whatsapp +569 9888 8777
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscuelaLandingPage;