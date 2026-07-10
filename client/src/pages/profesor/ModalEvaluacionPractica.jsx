import React, { useState, useEffect } from 'react';
import { Card } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

const ModalEvaluacionPractica = ({ clase, alumno, profesor, onClose }) => {
  const [criterios, setCriterios] = useState([]);
  const [evaluacionId, setEvaluacionId] = useState(null);
  const [criteriosSeleccionados, setCriteriosSeleccionados] = useState([]);
  const [notaActual, setNotaActual] = useState(7.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [faltaGraveDetectada, setFaltaGraveDetectada] = useState(null);
  const [evaluacionTerminada, setEvaluacionTerminada] = useState(false);

  const token = authService.getToken();

  useEffect(() => {
    inicializarEvaluacion();
  }, []);

  const inicializarEvaluacion = async () => {
    try {
      setLoading(true);

      // Cargar criterios
      const resCriterios = await fetch('http://localhost:5000/api/evaluacion-practica/criterios');
      const dataCriterios = await resCriterios.json();
      if (dataCriterios.success) {
        setCriterios(dataCriterios.criterios);
      }

      // Crear evaluación
      const resEval = await fetch('http://localhost:5000/api/evaluacion-practica', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clasePracticaId: clase.id,
          profesorId: profesor.profesorId,
          alumnoId: alumno.alumno_id
        })
      });

      const dataEval = await resEval.json();
      if (dataEval.success) {
        setEvaluacionId(dataEval.evaluacion.evaluacion_id);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al inicializar evaluación');
      setLoading(false);
    }
  };

  const agregarCriterio = async (criterioId) => {
    try {
      if (!evaluacionId) return;

      const response = await fetch('http://localhost:5000/api/evaluacion-practica/agregar-criterio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          evaluacionId,
          criterioId
        })
      });

      const data = await response.json();

      if (data.success) {
        const criterio = criterios.find(c => c.id === criterioId);
        setCriteriosSeleccionados([
          ...criteriosSeleccionados,
          criterio
        ]);

        if (data.terminar) {
          setFaltaGraveDetectada({
            nombre: data.falta_grave,
            tipo: data.tipo_falta,
            nota_final: data.nota_final,
            aprobado: data.aprobado
          });
          setNotaActual(data.nota_final);
          setEvaluacionTerminada(true);
        } else {
          setNotaActual(data.nota_actual);
        }
      } else {
        setError(data.message || 'Error al agregar criterio');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al agregar criterio');
    }
  };

  const terminarEvaluacion = async () => {
    try {
      if (!evaluacionId) return;

      const response = await fetch(
        `http://localhost:5000/api/evaluacion-practica/${evaluacionId}/terminar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setEvaluacionTerminada(true);
        setNotaActual(data.nota_final);
      } else {
        setError(data.message || 'Error al terminar evaluación');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al terminar evaluación');
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getColorTipo = (tipo) => {
    switch (tipo) {
      case 'baja': return '#fbbf24';
      case 'media': return '#f97316';
      case 'alta': return '#ef4444';
      default: return '#999';
    }
  };

  const criterinosDisponibles = criterios.filter(
    c => !criteriosSeleccionados.some(cs => cs.id === c.id)
  );

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          fontSize: '18px'
        }}>
          Inicializando evaluación...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '95vw',
          height: '95vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px 40px 20px 40px',
          backgroundColor: colors.profesor,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '12px 12px 0 0',
          gap: '60px',
          position: 'relative'
        }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '42px', fontWeight: '700' }}>
              INSTRUMENTO DE EVALUACIÓN
            </h1>
            <p style={{ margin: '8px 0 0 0', fontSize: '26px', opacity: 0.9 }}>
              {alumno.nombre} • {formatearFecha(clase.fecha)} • {clase.horaInicio}
            </p>
          </div>

          {/* Nota Actual - Centro */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            border: '3px solid white',
            padding: '12px 24px',
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start'
          }}>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Nota Actual
            </p>
            <p style={{
              margin: '6px 0 0 0',
              fontSize: '72px',
              fontWeight: '700',
              color: 'white',
              lineHeight: '1'
            }}>
              {notaActual.toFixed(1)}
            </p>
          </div>

          {/* Profesor y Clase - Derecha */}
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '12px 20px',
              borderRadius: '8px',
              minWidth: '200px'
            }}>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>PROFESOR</p>
              <p style={{ margin: '3px 0 0 0', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>
                {profesor.nombre}
              </p>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>CLASE</p>
              <p style={{ margin: '3px 0 0 0', fontSize: '22px', fontWeight: '700' }}>
                Nº{clase.id}
              </p>
            </div>
          </div>

          {/* Botón Cerrar - Esquina Superior Izquierda */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '32px',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {error && (
            <div style={{
              padding: '20px',
              backgroundColor: '#fee2e2',
              borderLeft: `6px solid #dc2626`,
              borderRadius: '8px',
              marginBottom: '30px'
            }}>
              <p style={{ color: '#991b1b', margin: 0, fontSize: '16px', fontWeight: '600' }}>
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* Estado Evaluación */}
          {evaluacionTerminada && (
            <div style={{
              padding: '30px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              marginBottom: '40px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '18px', color: '#666', fontWeight: '700' }}>
                {notaActual > 4 ? '✓ APROBADO' : '✗ NO APROBADO'}
              </p>
            </div>
          )}

          {/* Falta Grave Detectada */}
          {faltaGraveDetectada && (
            <div style={{
              padding: '30px',
              backgroundColor: '#fee2e2',
              borderLeft: `6px solid #dc2626`,
              borderRadius: '8px',
              marginBottom: '40px'
            }}>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#991b1b', marginBottom: '12px' }}>
                <AlertTriangle size={24} style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
                ⚠️ FALTA GRAVE DETECTADA
              </p>
              <p style={{ margin: 0, fontSize: '16px', color: '#7f1d1d', fontWeight: '600' }}>
                {faltaGraveDetectada.nombre}
              </p>
              <p style={{
                margin: '8px 0 0 0',
                fontSize: '14px',
                color: '#7f1d1d',
                textTransform: 'uppercase',
                fontWeight: '600'
              }}>
                Tipo: {faltaGraveDetectada.tipo}
              </p>
            </div>
          )}

          {!evaluacionTerminada && (
            <>
              {/* Criterios Layout */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 250px',
                gap: '40px',
                flex: 1
              }}>
                {/* Columna Izquierda - Criterios */}
                <div>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: colors.textPrimary,
                    marginBottom: '24px',
                    margin: '0 0 24px 0',
                    textAlign: 'left'
                  }}>
                    Criterio
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {criterinosDisponibles.map(criterio => (
                      <button
                        key={criterio.id}
                        onClick={() => agregarCriterio(criterio.id)}
                        style={{
                          padding: '20px 24px',
                          backgroundColor: 'white',
                          border: `5px solid ${getColorTipo(criterio.tipo_falta)}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          color: colors.textPrimary
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = getColorTipo(criterio.tipo_falta);
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = colors.textPrimary;
                        }}
                      >
                        <span style={{ fontSize: '28px' }}>•</span>
                        <span style={{ fontSize: '18px', fontWeight: '600', flex: 1 }}>
                          {criterio.nombre}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Columna Derecha - Tipos de Falta */}
                <div>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: colors.textPrimary,
                    marginBottom: '24px',
                    margin: '0 0 24px 0'
                  }}>
                    Tipo de falta
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[
                      { nombre: 'Baja', tipo: 'baja' },
                      { nombre: 'Media', tipo: 'media' },
                      { nombre: 'Alta', tipo: 'alta' }
                    ].map(falta => (
                      <div key={falta.tipo} style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          backgroundColor: getColorTipo(falta.tipo),
                          margin: '0 auto 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.1)`
                        }} />
                        <p style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: '700',
                          color: colors.textPrimary
                        }}>
                          {falta.nombre}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Criterios Aplicados */}
          {criteriosSeleccionados.length > 0 && (
            <div style={{ marginTop: '40px', borderTop: `2px solid #e5e7eb`, paddingTop: '40px' }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: '24px',
                margin: '0 0 24px 0'
              }}>
                Criterios Aplicados ({criteriosSeleccionados.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {criteriosSeleccionados.map((criterio, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '20px 24px',
                      backgroundColor: '#f3f4f6',
                      borderLeft: `6px solid ${getColorTipo(criterio.tipo_falta)}`,
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
                        {criterio.nombre}
                      </p>
                      <p style={{
                        margin: '8px 0 0 0',
                        fontSize: '14px',
                        color: '#666',
                        textTransform: 'uppercase',
                        fontWeight: '600'
                      }}>
                        {criterio.tipo_falta}
                      </p>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#ef4444'
                    }}>
                      -{criterio.puntaje_descuento}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Botones */}
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'flex-end',
          borderTop: `2px solid #e5e7eb`,
          padding: '30px 40px',
          backgroundColor: '#fafafa'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '16px 32px',
              backgroundColor: '#e5e7eb',
              color: colors.textPrimary,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '700'
            }}
          >
            Cancelar
          </button>

          {!evaluacionTerminada && (
            <button
              onClick={terminarEvaluacion}
              disabled={criteriosSeleccionados.length === 0}
              style={{
                padding: '16px 32px',
                backgroundColor: criteriosSeleccionados.length === 0 ? '#d1d5db' : colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: criteriosSeleccionados.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '700'
              }}
            >
              Terminar Evaluación
            </button>
          )}

          {evaluacionTerminada && (
            <button
              onClick={onClose}
              style={{
                padding: '16px 32px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '700'
              }}
            >
              <CheckCircle size={20} style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
              Evaluación Completada
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalEvaluacionPractica;
