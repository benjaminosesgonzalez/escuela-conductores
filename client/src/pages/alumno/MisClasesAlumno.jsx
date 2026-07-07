import React, { useState, useEffect } from 'react';
import { Card } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';
import './MisClasesAlumno.css';

const MisClasesAlumno = () => {
  const [clasesPresenciales, setClasesPresenciales] = useState([]);
  const [clasesOnline, setClasesOnline] = useState({
    proximas: [],
    completadas: [],
    canceladas: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('presenciales');
  const [copiado, setCopiado] = useState(null);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    obtenerTodasLasClases();
    const intervalo = setInterval(obtenerTodasLasClases, 30000);
    return () => clearInterval(intervalo);
  }, []);

  const obtenerTodasLasClases = async () => {
    try {
      if (!currentUser?.alumnoId) {
        console.error('No alumnoId found');
        setLoading(false);
        return;
      }

      // Obtener clases presenciales
      const responsePresenciales = await fetch(`/api/clases/${currentUser.alumnoId}`);
      if (responsePresenciales.ok) {
        const data = await responsePresenciales.json();
        setClasesPresenciales(data.data || []);
      }

      // Obtener clases online
      const responseOnline = await fetch('/api/clases-online-alumno/mis-clases', {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });
      if (responseOnline.ok) {
        const data = await responseOnline.json();
        setClasesOnline(data);
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

  const puedeAccederZoom = (clase) => {
    if (!clase.linkZoom) return false;
    const ahora = new Date();
    const fecha = new Date(clase.fecha + 'T00:00:00');
    const [horas, minutos] = clase.horaInicio.split(':');
    fecha.setHours(parseInt(horas), parseInt(minutos), 0, 0);
    const horaPermitida = new Date(fecha.getTime() - 15 * 60000);
    return ahora >= horaPermitida;
  };

  const copiarLinkZoom = (link, claseId) => {
    navigator.clipboard.writeText(link);
    setCopiado(claseId);
    setTimeout(() => setCopiado(null), 2000);
  };

  const obtenerFechaFormato = (fecha) => {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div style={{ padding: spacing.lg }}>Cargando clases...</div>;
  }

  const TabContent = ({ titulo, clases, esPresencial }) => (
    <div>
      <h3 style={{ marginBottom: spacing.md, color: colors.alumno }}>{titulo}</h3>
      {clases.length === 0 ? (
        <Card>
          <p style={{ color: '#999', textAlign: 'center' }}>
            No tienes {titulo.toLowerCase()} aún
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
                <h4 style={{ marginBottom: spacing.xs, color: colors.alumno }}>
                  {esPresencial
                    ? diasSemana[clase.diaSemana] || clase.diaSemana
                    : clase.nombreTema}
                </h4>
                <p style={{ color: '#666', marginBottom: spacing.sm }}>
                  🕐 {clase.horaInicio} - {clase.horaFin}
                </p>
                {!esPresencial && (
                  <p style={{ color: '#666', marginBottom: spacing.sm }}>
                    📅 {obtenerFechaFormato(clase.fecha)}
                  </p>
                )}
              </div>

              <div
                style={{
                  padding: spacing.md,
                  backgroundColor: '#f0f0f0',
                  borderRadius: spacing.radius.md,
                  marginBottom: spacing.md,
                }}
              >
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#999' }}>
                  Profesor
                </p>
                <p style={{ margin: 0, fontWeight: '600' }}>
                  {clase.profesor?.nombre || clase.nombreProfesor || 'Por asignar'}
                </p>
              </div>

              {!esPresencial && clase.linkZoom && puedeAccederZoom(clase) && (
                <div
                  style={{
                    padding: spacing.sm,
                    backgroundColor: '#e0f7fa',
                    borderRadius: spacing.radius.md,
                    marginBottom: spacing.md,
                    borderLeft: '4px solid #00bcd4',
                  }}
                >
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#00695c', fontWeight: '600' }}>
                    ✓ Link de Zoom disponible
                  </p>
                  <button
                    onClick={() => copiarLinkZoom(clase.linkZoom, clase.id)}
                    style={{
                      width: '100%',
                      padding: '6px 12px',
                      backgroundColor: '#00bcd4',
                      color: 'white',
                      border: 'none',
                      borderRadius: spacing.radius.md,
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    {copiado === clase.id ? '✓ Copiado' : '📋 Copiar Link'}
                  </button>
                </div>
              )}

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
                  {esPresencial ? clase.estado || 'confirmada' : clase.estado}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: spacing.lg }}>
      <h2 style={{ marginBottom: spacing.lg, color: colors.alumno }}>Mis Clases</h2>

      <div className="mis-clases-tabs">
        <button
          className={`tab-button ${activeTab === 'presenciales' ? 'active' : ''}`}
          onClick={() => setActiveTab('presenciales')}
        >
          📚 Clases Presenciales ({clasesPresenciales.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'onlineProximas' ? 'active' : ''}`}
          onClick={() => setActiveTab('onlineProximas')}
        >
          📅 Clases Online Próximas ({clasesOnline.proximas.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'onlineCompletadas' ? 'active' : ''}`}
          onClick={() => setActiveTab('onlineCompletadas')}
        >
          ✓ Completadas ({clasesOnline.completadas.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'onlineCanceladas' ? 'active' : ''}`}
          onClick={() => setActiveTab('onlineCanceladas')}
        >
          ✕ Canceladas ({clasesOnline.canceladas.length})
        </button>
      </div>

      <div style={{ marginTop: spacing.lg }}>
        {activeTab === 'presenciales' && (
          <TabContent titulo="Clases Presenciales" clases={clasesPresenciales} esPresencial={true} />
        )}
        {activeTab === 'onlineProximas' && (
          <TabContent titulo="Clases Online Próximas" clases={clasesOnline.proximas} esPresencial={false} />
        )}
        {activeTab === 'onlineCompletadas' && (
          <TabContent titulo="Clases Completadas" clases={clasesOnline.completadas} esPresencial={false} />
        )}
        {activeTab === 'onlineCanceladas' && (
          <TabContent titulo="Clases Canceladas" clases={clasesOnline.canceladas} esPresencial={false} />
        )}
      </div>
    </div>
  );
};

export default MisClasesAlumno;
