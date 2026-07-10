import React, { useState, useEffect } from 'react';
import { Card } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';
import { Clock, Users, AlertCircle, CheckCircle } from 'lucide-react';
import ModalEvaluacionPractica from './ModalEvaluacionPractica.jsx';

const EvaluacionPracticaProfesor = () => {
  const currentUser = authService.getCurrentUser();
  const profesorId = currentUser?.profesorId;
  const profesorNombre = currentUser?.nombre || 'Profesor';

  const [clasesPracticas, setClasesPracticas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);

  useEffect(() => {
    cargarClasesPracticas();
  }, []);

  const cargarClasesPracticas = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!profesorId) {
        setError('No se pudo identificar al profesor');
        return;
      }

      const token = authService.getToken();
      const response = await fetch(
        `http://localhost:5000/api/evaluacion-practica/profesor/${profesorId}/clases-practicas`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Error al cargar clases');

      const data = await response.json();

      if (data.success) {
        // Agrupar por clase
        const agrupadas = {};
        data.clases.forEach(clase => {
          const key = `${clase.id}-${clase.fecha}-${clase.horaInicio}`;
          if (!agrupadas[key]) {
            agrupadas[key] = {
              id: clase.id,
              fecha: clase.fecha,
              horaInicio: clase.horaInicio,
              horaFin: clase.horaFin,
              alumnos: []
            };
          }
          agrupadas[key].alumnos.push({
            alumno_id: clase.alumno_id,
            nombre: clase.alumno_nombre,
            apellido: clase.alumno_apellido,
            inscripcion_id: clase.inscripcion_id
          });
        });

        setClasesPracticas(Object.values(agrupadas));
      } else {
        setError(data.message || 'Error al cargar clases');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar clases prácticas');
    } finally {
      setLoading(false);
    }
  };

  const abrirEvaluacion = (clase, alumno) => {
    setClaseSeleccionada(clase);
    setAlumnoSeleccionado(alumno);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setClaseSeleccionada(null);
    setAlumnoSeleccionado(null);
    cargarClasesPracticas();
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const formatted = date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  if (loading) {
    return (
      <div style={{ padding: spacing.lg, textAlign: 'center' }}>
        Cargando clases prácticas...
      </div>
    );
  }

  return (
    <div style={{ padding: spacing.lg }}>
      <div style={{ marginBottom: spacing.lg }}>
        <h2 style={{ color: colors.profesor, marginBottom: spacing.md, fontSize: '32px' }}>
          📝 Evaluación Práctica
        </h2>

        {error && (
          <Card style={{ backgroundColor: '#fee2e2', borderLeft: '4px solid #dc2626' }}>
            <p style={{ color: '#991b1b', margin: 0 }}>
              <AlertCircle size={16} style={{ display: 'inline', marginRight: '8px' }} />
              {error}
            </p>
          </Card>
        )}

        {success && (
          <Card style={{ backgroundColor: '#dcfce7', borderLeft: '4px solid #16a34a' }}>
            <p style={{ color: '#15803d', margin: 0 }}>
              <CheckCircle size={16} style={{ display: 'inline', marginRight: '8px' }} />
              {success}
            </p>
          </Card>
        )}
      </div>

      {clasesPracticas.length === 0 ? (
        <Card>
          <p style={{ color: '#999', textAlign: 'center', margin: 0 }}>
            No tienes clases prácticas programadas
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg, maxWidth: '70%', margin: '0 auto' }}>
          {clasesPracticas.map((clase) => (
            <Card key={`${clase.id}-${clase.fecha}`}>
              <div style={{ marginBottom: spacing.md }}>
                <h4 style={{ color: colors.profesor, marginBottom: spacing.xs, fontSize: '26px' }}>
                  {formatearFecha(clase.fecha)}
                </h4>
                <div style={{ display: 'flex', gap: spacing.lg, marginTop: spacing.sm }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                    <Clock size={20} color={colors.textSecondary} />
                    <p style={{ margin: 0, fontSize: '23px', color: colors.textSecondary }}>
                      {clase.horaInicio} - {clase.horaFin}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                    <Users size={20} color={colors.textSecondary} />
                    <p style={{ margin: 0, fontSize: '23px', color: colors.textSecondary }}>
                      {clase.alumnos.length} alumno{clase.alumnos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${colors.borderLight}`, paddingTop: spacing.md }}>
                {clase.alumnos.map((alumno) => (
                  <div
                    key={alumno.alumno_id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: spacing.md,
                      marginBottom: spacing.md,
                      borderBottom: `1px solid ${colors.borderLight}`
                    }}
                  >
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: '500' }}>
                      {alumno.nombre} {alumno.apellido}
                    </p>
                    <button
                      onClick={() => abrirEvaluacion(clase, alumno)}
                      style={{
                        padding: `${spacing.padding.md} ${spacing.padding.lg}`,
                        backgroundColor: colors.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: spacing.radius.md,
                        cursor: 'pointer',
                        fontSize: '26px',
                        fontWeight: '600'
                      }}
                    >
                      Iniciar Evaluación
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {modalOpen && claseSeleccionada && alumnoSeleccionado && (
        <ModalEvaluacionPractica
          clase={claseSeleccionada}
          alumno={alumnoSeleccionado}
          profesor={{ nombre: profesorNombre, profesorId }}
          onClose={cerrarModal}
        />
      )}
    </div>
  );
};

export default EvaluacionPracticaProfesor;
