import React, { useState, useEffect } from 'react';
import { Card } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';

const MisClasesAlumno = () => {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    obtenerClases();
  }, []);

  const obtenerClases = async () => {
    try {
      if (!currentUser?.alumnoId) {
        console.error('No alumnoId found');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/clases/${currentUser.alumnoId}`);
      if (response.ok) {
        const data = await response.json();
        setClases(data.data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error obteniendo clases:', error);
      setLoading(false);
    }
  };

  const diasSemana = {
    lunes: 'Lunes',
    martes: 'Martes',
    miércoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
  };

  if (loading) {
    return <div style={{ padding: spacing.lg }}>Cargando clases...</div>;
  }

  return (
    <div style={{ padding: spacing.lg }}>
      <h2 style={{ marginBottom: spacing.md, color: colors.alumno }}>Mis Clases</h2>

      {clases.length === 0 ? (
        <Card>
          <p style={{ color: '#999', textAlign: 'center' }}>
            No tienes clases agendadas aún
          </p>
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: spacing.lg,
          }}
        >
          {clases.map((clase) => (
            <Card key={clase.id}>
              <div style={{ marginBottom: spacing.md }}>
                <h3 style={{ marginBottom: spacing.xs }}>{diasSemana[clase.diaSemana] || clase.diaSemana}</h3>
                <p style={{ color: '#666', marginBottom: spacing.sm }}>
                  🕐 {clase.horaInicio} - {clase.horaFin}
                </p>
              </div>

              <div
                style={{
                  padding: spacing.md,
                  backgroundColor: '#f0f0f0',
                  borderRadius: spacing.radius.md,
                }}
              >
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#999' }}>
                  Profesor
                </p>
                <p style={{ margin: 0, fontWeight: '600' }}>
                  {clase.profesor?.nombre || 'Por asignar'}
                </p>
              </div>

              <div style={{ marginTop: spacing.md }}>
                <span
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: spacing.radius.full,
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  {clase.estado || 'confirmada'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisClasesAlumno;
