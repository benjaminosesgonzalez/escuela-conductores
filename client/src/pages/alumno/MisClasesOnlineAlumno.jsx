import React, { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import "./MisClasesOnlineAlumno.css";

const MisClasesOnlineAlumno = () => {
  const [misClases, setMisClases] = useState({
    proximas: [],
    completadas: [],
    canceladas: [],
  });
  const [loading, setLoading] = useState(true);
  const [tabActiva, setTabActiva] = useState("proximas");
  const [mensaje, setMensaje] = useState(null);
  const [copiado, setCopiado] = useState(null);

  useEffect(() => {
    cargarMisClases();
    const intervalo = setInterval(cargarMisClases, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(intervalo);
  }, []);

  const cargarMisClases = async () => {
    try {
      const response = await fetch("/api/clases-online-alumno/mis-clases", {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setMisClases(data);
      }
    } catch (error) {
      console.error("Error cargando mis clases:", error);
    }
    setLoading(false);
  };

  const copiarLinkZoom = (link, claseId) => {
    navigator.clipboard.writeText(link);
    setCopiado(claseId);
    setMensaje({
      tipo: "exito",
      texto: "Link de Zoom copiado al portapapeles",
    });
    setTimeout(() => setCopiado(null), 2000);
    setTimeout(() => setMensaje(null), 3000);
  };

  const abrirZoom = (link) => {
    window.open(link, "_blank");
  };

  const obtenerFechaFormato = (fecha) => {
    const date = new Date(fecha + "T00:00:00");
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const puedeAccederZoom = (clase) => {
    if (!clase.linkZoom) return false;

    const ahora = new Date();
    const fecha = new Date(clase.fecha + "T00:00:00");
    const [horas, minutos] = clase.horaInicio.split(":");
    fecha.setHours(parseInt(horas), parseInt(minutos), 0, 0);

    // Permite acceder 15 minutos antes
    const horaPermitida = new Date(fecha.getTime() - 15 * 60000);
    return ahora >= horaPermitida;
  };

  const TarjetaClase = ({ clase, puedeVerZoom }) => (
    <div className="tarjeta-clase">
      <div className="clase-header">
        <h3>{clase.nombreTema}</h3>
        <span className={`badge-tema tema-${clase.numeroTema}`}>
          Tema {clase.numeroTema}
        </span>
      </div>

      <div className="clase-body">
        <div className="info-clase">
          <p className="fecha-clase">
            📅 {obtenerFechaFormato(clase.fecha)}
          </p>
          <p className="hora-clase">
            🕐 {clase.horaInicio} - {clase.horaFin}
          </p>
          <p className="profesor-clase">
            👨‍🏫 {clase.nombreProfesor}
          </p>
          <p className="estado-clase">
            📌 Estado: <strong>{clase.estado}</strong>
          </p>
        </div>

        {clase.linkZoom && puedeVerZoom && (
          <div className="zoom-section">
            <p className="zoom-disponible">✓ Link de Zoom disponible</p>
            <div className="zoom-buttons">
              <button
                onClick={() => copiarLinkZoom(clase.linkZoom, clase.id)}
                className="btn-copiar-zoom"
              >
                {copiado === clase.id ? "✓ Copiado" : "📋 Copiar Link"}
              </button>
              <button
                onClick={() => abrirZoom(clase.linkZoom)}
                className="btn-abrir-zoom"
              >
                🎥 Abrir Zoom
              </button>
            </div>
          </div>
        )}

        {clase.linkZoom && !puedeVerZoom && (
          <div className="zoom-section zoom-no-disponible">
            <p>
              El link de Zoom estará disponible 15 minutos antes de la clase
            </p>
          </div>
        )}

        {!clase.linkZoom && tabActiva === "proximas" && (
          <div className="zoom-section zoom-pendiente">
            <p>Esperando que el profesor agregue el link de Zoom</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTab = (tab, clases) => (
    <div className="tab-content">
      {clases.length === 0 ? (
        <div className="sin-clases">
          {tab === "proximas" && "No tienes clases próximas inscritas"}
          {tab === "completadas" && "No has completado ninguna clase"}
          {tab === "canceladas" && "No hay clases canceladas"}
        </div>
      ) : (
        <div className="grid-clases">
          {clases.map((clase) => (
            <TarjetaClase
              key={clase.id}
              clase={clase}
              puedeVerZoom={puedeAccederZoom(clase)}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="mis-clases-online-container">
        <div className="cargando">Cargando tus clases...</div>
      </div>
    );
  }

  return (
    <div className="mis-clases-online-container">
      <div className="header-clases">
        <h2>🎓 Mis Clases Online</h2>
      </div>

      {mensaje && (
        <div className={`mensaje mensaje-${mensaje.tipo}`}>{mensaje.texto}</div>
      )}

      <div className="tabs-container">
        <div className="tabs-header">
          <button
            className={`tab-button ${tabActiva === "proximas" ? "activa" : ""}`}
            onClick={() => setTabActiva("proximas")}
          >
            📅 Próximas ({misClases.proximas.length})
          </button>
          <button
            className={`tab-button ${
              tabActiva === "completadas" ? "activa" : ""
            }`}
            onClick={() => setTabActiva("completadas")}
          >
            ✓ Completadas ({misClases.completadas.length})
          </button>
          <button
            className={`tab-button ${
              tabActiva === "canceladas" ? "activa" : ""
            }`}
            onClick={() => setTabActiva("canceladas")}
          >
            ✕ Canceladas ({misClases.canceladas.length})
          </button>
        </div>

        {tabActiva === "proximas" && renderTab("proximas", misClases.proximas)}
        {tabActiva === "completadas" &&
          renderTab("completadas", misClases.completadas)}
        {tabActiva === "canceladas" &&
          renderTab("canceladas", misClases.canceladas)}
      </div>
    </div>
  );
};

export default MisClasesOnlineAlumno;
