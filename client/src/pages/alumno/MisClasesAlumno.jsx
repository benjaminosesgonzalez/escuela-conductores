import React, { useState, useEffect } from 'react';
import { Card } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';
import { X } from 'lucide-react';
import './MisClasesAlumno.css';

const MisClasesAlumno = ({ refreshTrigger = 0 }) => {
  const [clasesPracticas, setClasesPracticas] = useState([]);
  const [clasesOnline, setClasesOnline] = useState({
    proximas: [],
    completadas: [],
    canceladas: [],
  });
  const [clasesCompletadasTemas, setClasesCompletadasTemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('practicasProximas');
  const [copiado, setCopiado] = useState(null);
  const [modalMaterialOpen, setModalMaterialOpen] = useState(false);
  const [materialesClase, setMaterialesClase] = useState([]);
  const [loadingMateriales, setLoadingMateriales] = useState(false);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    obtenerTodasLasClases();
    const intervalo = setInterval(obtenerTodasLasClases, 30000);
    return () => clearInterval(intervalo);
  }, [refreshTrigger]);

  const obtenerTodasLasClases = async () => {
    try {
      if (!currentUser?.alumnoId) {
        console.error('No alumnoId found');
        setLoading(false);
        return;
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

      // Obtener clases prácticas
      const responsePracticas = await fetch('/api/clases-practicas-alumno/mis-clases', {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });
      if (responsePracticas.ok) {
        const data = await responsePracticas.json();
        setClasesPracticas(data.clases || []);
      }

      // Obtener clases completadas por temas
      const responseCompletadas = await fetch(`/api/avances-temas/${currentUser.alumnoId}/clases-completadas`, {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });
      if (responseCompletadas.ok) {
        const data = await responseCompletadas.json();
        setClasesCompletadasTemas(data.clases || []);
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
    try {
      const ahora = new Date();
      let fecha;

      // Handle both YYYY-MM-DD and ISO 8601 formats
      if (typeof clase.fecha === 'string') {
        if (clase.fecha.includes('T')) {
          // ISO 8601 format
          fecha = new Date(clase.fecha);
        } else {
          // YYYY-MM-DD format
          const [year, month, day] = clase.fecha.split('-');
          fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      } else {
        fecha = new Date(clase.fecha);
      }

      const [horas, minutos] = clase.horaInicio.split(':');
      fecha.setHours(parseInt(horas), parseInt(minutos), 0, 0);
      const horaPermitida = new Date(fecha.getTime() - 15 * 60000);
      return ahora >= horaPermitida;
    } catch (error) {
      console.error('Error calculating zoom access:', error);
      return false;
    }
  };

  const copiarLinkZoom = (link, claseId) => {
    navigator.clipboard.writeText(link);
    setCopiado(claseId);
    setTimeout(() => setCopiado(null), 2000);
  };

  const obtenerFechaFormato = (fechaInput) => {
    try {
      let date;

      // Handle both YYYY-MM-DD and ISO 8601 formats
      if (typeof fechaInput === 'string') {
        if (fechaInput.includes('T')) {
          // ISO 8601 format
          date = new Date(fechaInput);
        } else {
          // YYYY-MM-DD format
          const [year, month, day] = fechaInput.split('-');
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      } else {
        date = new Date(fechaInput);
      }

      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }

      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
  };

  const obtenerMaterialesClase = async (claseId) => {
    try {
      setLoadingMateriales(true);
      const response = await fetch(`/api/clase-material/${claseId}/materiales`);
      const data = await response.json();

      if (data.success) {
        setMaterialesClase(data.materiales || []);
      } else {
        setMaterialesClase([]);
      }
    } catch (error) {
      console.error('Error obteniendo materiales:', error);
      setMaterialesClase([]);
    } finally {
      setLoadingMateriales(false);
    }
  };

  const abrirMateriales = (claseId) => {
    obtenerMaterialesClase(claseId);
    setModalMaterialOpen(true);
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

              {!esPresencial && clase.linkZoom && (
                <button
                  onClick={() => window.open(clase.linkZoom, '_blank')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#00bcd4',
                    color: 'white',
                    border: 'none',
                    borderRadius: spacing.radius.md,
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: spacing.md,
                  }}
                >
                  🔗 Zoom
                </button>
              )}

              {!esPresencial && (
                <button
                  onClick={() => abrirMateriales(clase.id)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: spacing.radius.md,
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: spacing.md
                  }}
                >
                  📄 Ver Material
                </button>
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
          className={`tab-button ${activeTab === 'practicasProximas' ? 'active' : ''}`}
          onClick={() => setActiveTab('practicasProximas')}
        >
          🚗 Clases Prácticas Próximas ({clasesPracticas.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'onlineProximas' ? 'active' : ''}`}
          onClick={() => setActiveTab('onlineProximas')}
        >
          📅 Clases Online Próximas ({clasesOnline.proximas.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'temasCompletados' ? 'active' : ''}`}
          onClick={() => setActiveTab('temasCompletados')}
        >
          📚 Temas Completados ({clasesCompletadasTemas.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'onlineCanceladas' ? 'active' : ''}`}
          onClick={() => setActiveTab('onlineCanceladas')}
        >
          ✕ Canceladas ({clasesOnline.canceladas.length})
        </button>
      </div>

      <div style={{ marginTop: spacing.lg }}>
        {activeTab === 'practicasProximas' && (
          <TabContent titulo="Clases Prácticas Próximas" clases={clasesPracticas} esPresencial={true} />
        )}
        {activeTab === 'onlineProximas' && (
          <TabContent titulo="Clases Online Próximas" clases={clasesOnline.proximas} esPresencial={false} />
        )}
        {activeTab === 'temasCompletados' && (
          <div>
            <h3 style={{ marginBottom: spacing.md, color: colors.alumno }}>Temas Completados</h3>
            {clasesCompletadasTemas.length === 0 ? (
              <Card>
                <p style={{ color: '#999', textAlign: 'center' }}>
                  No has completado temas aún
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
                {clasesCompletadasTemas.map((tema, idx) => (
                  <Card key={idx}>
                    <div style={{ marginBottom: spacing.md }}>
                      <h4 style={{ marginBottom: spacing.xs, color: colors.alumno }}>
                        Tema {tema.numeroTema}: {tema.nombreTema}
                      </h4>
                      <p style={{ color: '#666', marginBottom: spacing.sm }}>
                        🕐 {tema.horaInicio} - {tema.horaFin}
                      </p>
                      <p style={{ color: '#666', marginBottom: spacing.sm }}>
                        📅 {obtenerFechaFormato(tema.fecha)}
                      </p>
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
                        {tema.profesorNombre || 'Por asignar'}
                      </p>
                    </div>

                    <button
                      onClick={() => abrirMateriales(tema.id)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: spacing.radius.md,
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        marginBottom: spacing.md
                      }}
                    >
                      📄 Ver Material
                    </button>

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
                        ✓ Completado
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'onlineCanceladas' && (
          <TabContent titulo="Clases Canceladas" clases={clasesOnline.canceladas} esPresencial={false} />
        )}
      </div>

      {modalMaterialOpen && (
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
          }}
          onClick={() => setModalMaterialOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Materiales de la clase</h2>
              <button
                onClick={() => setModalMaterialOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>

            {loadingMateriales ? (
              <p style={{ textAlign: 'center', color: '#666' }}>Cargando materiales...</p>
            ) : materialesClase && materialesClase.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {materialesClase.map((material) => (
                  <div
                    key={material.id}
                    style={{
                      padding: '12px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '6px',
                      borderLeft: '4px solid #8b5cf6',
                    }}
                  >
                    <p style={{ margin: '0 0 8px 0', fontWeight: '600', fontSize: '14px' }}>
                      {material.nombre}
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
                      Tipo: {material.tipo || 'Archivo'}
                    </p>
                    <a
                      href={`/api/repositorio/descargar/${material.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      📥 Descargar
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#999' }}>No hay materiales disponibles para esta clase</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MisClasesAlumno;
