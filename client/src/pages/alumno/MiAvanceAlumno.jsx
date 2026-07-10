import React, { useState, useEffect } from 'react';
import { Card } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';
import { BookOpen, CheckCircle2 } from 'lucide-react';

const MiAvanceAlumno = () => {
  const currentUser = authService.getCurrentUser();
  const alumnoId = currentUser?.alumnoId;
  const [temas, setTemas] = useState([]);
  const [practicas, setPracticas] = useState({
    completadas: 0,
    cantidadMaxima: 0,
    evaluaciones: [],
  });
  const [loadingTemas, setLoadingTemas] = useState(true);
  const [loadingPracticas, setLoadingPracticas] = useState(true);

  useEffect(() => {
    if (alumnoId) {
      cargarAvance();
    }
  }, [alumnoId]);

  const cargarAvance = async () => {
    try {
      const token = authService.getToken();

      // Cargar avance de temas
      const resTemas = await fetch(
        `http://localhost:5000/api/alumnos/${alumnoId}/avance-temas`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const dataTemas = await resTemas.json();
      setTemas(dataTemas.temas || []);
      setLoadingTemas(false);

      // Cargar avance de prácticas
      const resPracticas = await fetch(
        `http://localhost:5000/api/alumnos/${alumnoId}/avance-practicas`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const dataPracticas = await resPracticas.json();
      setPracticas(dataPracticas);
      setLoadingPracticas(false);
    } catch (error) {
      console.error('Error cargando avance:', error);
      setLoadingTemas(false);
      setLoadingPracticas(false);
    }
  };

  return (
    <div>
      {/* BLOQUE 1: AVANCE CLASES TEÓRICAS */}
      <Card title="Avance clases teóricas" icon={BookOpen}>
        {loadingTemas ? (
          <p style={{ color: colors.textSecondary }}>Cargando...</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: spacing.gap.normal,
              marginBottom: spacing.margin.lg,
            }}
          >
            {temas.map((tema, index) => (
              <div
                key={tema.id}
                style={{
                  padding: spacing.padding.lg,
                  backgroundColor: tema.completado ? '#ecfdf5' : colors.background,
                  borderRadius: spacing.radius.md,
                  border: `2px solid ${
                    tema.completado ? colors.success : colors.borderLight
                  }`,
                  textAlign: 'center',
                  minHeight: '130px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <p
                  style={{
                    fontSize: '13px',
                    color: colors.textSecondary,
                    margin: 0,
                    fontWeight: '600',
                  }}
                >
                  Tema {index + 1}
                </p>
                <p
                  style={{
                    fontSize: '14px',
                    color: tema.completado ? colors.textPrimary : colors.textPrimary,
                    margin: 0,
                    fontWeight: '500',
                    wordWrap: 'break-word',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {tema.nombre}
                </p>
                {tema.completado ? (
                  <p
                    style={{
                      fontSize: '12px',
                      color: colors.success,
                      margin: 0,
                      fontWeight: '600',
                    }}
                  >
                    ✓ Completado
                  </p>
                ) : (
                  <p
                    style={{
                      fontSize: '12px',
                      color: colors.textTertiary,
                      margin: 0,
                    }}
                  >
                    Pendiente
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* BLOQUE 2: AVANCE CLASES PRÁCTICAS */}
      <Card
        title="Avance clases prácticas"
        icon={CheckCircle2}
        style={{ marginTop: spacing.margin.xlarge }}
      >
        {loadingPracticas ? (
          <p style={{ color: colors.textSecondary }}>Cargando...</p>
        ) : (
          <>
            {/* CONTADOR */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.gap.normal,
                marginBottom: spacing.margin.xlarge,
                padding: spacing.padding.lg,
                backgroundColor: '#f0f9ff',
                borderRadius: spacing.radius.md,
                borderLeft: `4px solid ${colors.primary}`,
              }}
            >
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: colors.primary,
                }}
              >
                {practicas.completadas}
              </span>
              <span
                style={{
                  fontSize: '18px',
                  color: colors.textSecondary,
                }}
              >
                de {practicas.cantidadMaxima} clases prácticas completadas
              </span>
            </div>

            {/* BLOQUES DE CLASES */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: spacing.gap.normal,
              }}
            >
              {Array.from({ length: practicas.cantidadMaxima }).map(
                (_, index) => {
                  const evaluacion = practicas.evaluaciones[index];
                  const estaCompletada = evaluacion && evaluacion.evaluacionId !== null;

                  return (
                    <div
                      key={index}
                      style={{
                        padding: spacing.padding.lg,
                        backgroundColor: estaCompletada ? '#ecfdf5' : colors.background,
                        borderRadius: spacing.radius.md,
                        border: `2px solid ${
                          estaCompletada ? colors.success : colors.borderLight
                        }`,
                        textAlign: 'center',
                        minHeight: '130px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '13px',
                          color: colors.textSecondary,
                          margin: 0,
                          fontWeight: '600',
                        }}
                      >
                        Clase {index + 1}
                      </p>
                      {estaCompletada ? (
                        <>
                          <p
                            style={{
                              fontSize: '32px',
                              fontWeight: 'bold',
                              color: colors.success,
                              margin: 0,
                            }}
                          >
                            {evaluacion.nota}
                          </p>
                          <p
                            style={{
                              fontSize: '12px',
                              color: colors.textSecondary,
                              margin: 0,
                            }}
                          >
                            ✓ Completada
                          </p>
                        </>
                      ) : (
                        <p
                          style={{
                            fontSize: '14px',
                            color: colors.textTertiary,
                            margin: 0,
                          }}
                        >
                          Pendiente
                        </p>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default MiAvanceAlumno;
