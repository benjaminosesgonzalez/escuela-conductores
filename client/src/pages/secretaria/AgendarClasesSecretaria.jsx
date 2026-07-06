import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';

const AgendarClasesSecretaria = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDisponibilidad, setSelectedDisponibilidad] = useState(null);
  const [selectedProfesor, setSelectedProfesor] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    obtenerAlumnos();
  }, []);

  const obtenerAlumnos = async () => {
    try {
      const response = await fetch('/api/clases/alumnos-para-agendar');
      if (response.ok) {
        const data = await response.json();
        setAlumnos(data.data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error obteniendo alumnos:', error);
      setMessage('Error al cargar alumnos');
      setLoading(false);
    }
  };

  const obtenerProfesores = async (dia, horaInicio, horaFin) => {
    try {
      const response = await fetch(
        `/api/clases/profesores-disponibles?dia=${dia}&horaInicio=${horaInicio}&horaFin=${horaFin}`
      );
      if (response.ok) {
        const data = await response.json();
        setProfesores(data.data || []);
      }
    } catch (error) {
      console.error('Error obteniendo profesores:', error);
      setMessage('Error al cargar profesores disponibles');
    }
  };

  const handleSelectDisponibilidad = (alumno, disponibilidad) => {
    setSelectedDisponibilidad({
      alumnoId: alumno.alumno.id,
      alumnoNombre: alumno.alumno.nombre,
      ...disponibilidad,
    });
    setSelectedProfesor(null);
    obtenerProfesores(disponibilidad.diaSemana, disponibilidad.horaInicio, disponibilidad.horaFin);
  };

  const handleConfirmarClase = async () => {
    if (!selectedDisponibilidad || !selectedProfesor) {
      setMessage('Por favor selecciona un profesor');
      return;
    }

    try {
      const response = await fetch('/api/clases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alumnoId: selectedDisponibilidad.alumnoId,
          profesorId: selectedProfesor.profesor.id,
          diaSemana: selectedDisponibilidad.diaSemana,
          horaInicio: selectedDisponibilidad.horaInicio,
          horaFin: selectedDisponibilidad.horaFin,
        }),
      });

      if (response.ok) {
        setMessage('Clase agendada exitosamente');
        setSelectedDisponibilidad(null);
        setSelectedProfesor(null);
        setProfesores([]);
        obtenerAlumnos();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error al agendar la clase');
      }
    } catch (error) {
      console.error('Error confirmando clase:', error);
      setMessage('Error al agendar la clase');
    }
  };

  if (loading) {
    return <div style={{ padding: spacing.lg }}>Cargando...</div>;
  }

  return (
    <div style={{ padding: spacing.lg }}>
      <h2 style={{ marginBottom: spacing.md, color: colors.secretaria }}>Agendar Clases</h2>

      {message && (
        <div
          style={{
            padding: spacing.md,
            marginBottom: spacing.md,
            backgroundColor: '#10b981',
            color: 'white',
            borderRadius: spacing.radius.md,
          }}
        >
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
        {/* Lista de alumnos */}
        <Card>
          <h3 style={{ marginBottom: spacing.md }}>Alumnos Solicitando Clase</h3>
          {alumnos.length === 0 ? (
            <p style={{ color: '#999' }}>No hay alumnos solicitando clases</p>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {alumnos.map((alumnoData) => (
                <div key={alumnoData.alumno.id} style={{ marginBottom: spacing.md }}>
                  <h4 style={{ marginBottom: spacing.sm }}>{alumnoData.alumno.nombre}</h4>
                  {alumnoData.disponibilidades.map((disp) => (
                    <div
                      key={`${disp.alumnoId}-${disp.diaSemana}-${disp.horaInicio}`}
                      onClick={() => handleSelectDisponibilidad(alumnoData, disp)}
                      style={{
                        padding: spacing.sm,
                        marginBottom: spacing.sm,
                        backgroundColor:
                          selectedDisponibilidad?.id === disp.id ? colors.secretaria : '#f0f0f0',
                        color: selectedDisponibilidad?.id === disp.id ? 'white' : 'black',
                        borderRadius: spacing.radius.sm,
                        cursor: 'pointer',
                      }}
                    >
                      {disp.diaSemana.toUpperCase()} - {disp.horaInicio} a {disp.horaFin}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Selección de profesor */}
        <Card>
          {selectedDisponibilidad ? (
            <>
              <h3 style={{ marginBottom: spacing.md }}>
                Selecciona Profesor para {selectedDisponibilidad.alumnoNombre}
              </h3>
              <p style={{ marginBottom: spacing.md, color: '#666' }}>
                {selectedDisponibilidad.diaSemana.toUpperCase()} - {selectedDisponibilidad.horaInicio} a{' '}
                {selectedDisponibilidad.horaFin}
              </p>

              {profesores.length === 0 ? (
                <p style={{ color: '#999' }}>No hay profesores disponibles en este horario</p>
              ) : (
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {profesores.map((prof) => (
                    <div
                      key={prof.profesor.id}
                      onClick={() => setSelectedProfesor(prof)}
                      style={{
                        padding: spacing.md,
                        marginBottom: spacing.sm,
                        backgroundColor: selectedProfesor?.profesor.id === prof.profesor.id ? colors.secretaria : '#f0f0f0',
                        color: selectedProfesor?.profesor.id === prof.profesor.id ? 'white' : 'black',
                        borderRadius: spacing.radius.sm,
                        cursor: 'pointer',
                      }}
                    >
                      <h4>{prof.profesor.nombre}</h4>
                    </div>
                  ))}
                </div>
              )}

              {selectedProfesor && (
                <Button
                  variant="success"
                  style={{ marginTop: spacing.md, width: '100%' }}
                  onClick={handleConfirmarClase}
                >
                  Confirmar Clase
                </Button>
              )}
            </>
          ) : (
            <p style={{ color: '#999' }}>Selecciona una disponibilidad de alumno</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AgendarClasesSecretaria;
