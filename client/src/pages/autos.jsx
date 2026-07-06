import React, { useEffect, useState } from "react";
import {
  Car,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Filter,
  FileText,
} from "lucide-react";
import { authService } from "../services/authService";

export default function VehiculosYSolicitudes() {
  // 1. Datos de Sesión e Identificación de Rol
  const currentUser = authService.getCurrentUser();
  const userRol = currentUser?.rol || "alumno"; // 'administracion', 'secretaria', 'profesor', 'alumno'
  const userToken = localStorage.getItem("token");
  const backendUrl = "http://localhost:5000/api"; // Puerto 5000 según nuestro diseño de backend

  // 2. Estados de datos globales
  const [sedes, setSedes] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [disponibilidadFlota, setDisponibilidadFlota] = useState(null);

  // Filtro exclusivo para la secretaria
  const [sedeSeleccionadaFilter, setSedeSeleccionadaFilter] = useState("");

  // 3. Estados para el Formulario (Profesores y Alumnos)
  const [fechaUso, setFechaUso] = useState("");
  const [horaUso, setHoraUso] = useState("");
  const [horaTermino, setHoraTermino] = useState("");
  const [idSede, setIdSede] = useState("");
  const [estadoMatricula, setEstadoMatricula] = useState("");
  const [detalles, setDetalles] = useState("");

  // Estados operativos de UI
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [cargando, setCargando] = useState(false);

  // 4. Ciclo de Carga Inicial según el Rol
  useEffect(() => {
    cargarSedes();
    if (userRol === "secretaria" || userRol === "administracion") {
      // Si ya hay una sede seleccionada en el filtro, cargar sus solicitudes
      if (sedeSeleccionadaFilter) {
        cargarSolicitudesPorSede(sedeSeleccionadaFilter);
      }
    } else {
      // Profesores y alumnos cargan su propio historial personal
      cargarMisSolicitudes();
      if (userRol === "alumno") {
        fetch(`${backendUrl}/alumnos/mi-estado`, {
          headers: { Authorization: `Bearer ${userToken}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) setEstadoMatricula(data.estado_matricula);
          })
          .catch((err) => console.error("Error obteniendo estado:", err));
      }
    }
  }, [sedeSeleccionadaFilter]);

  // 5. Funciones de conexión a la API (Backend)
const cargarSedes = async () => {
    try {
      const res = await fetch(`${backendUrl}/sedes`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await res.json();
      // Tu backend maneja { success: true, data: [sedes] }
      if (data.success) setSedes(data.data); 
    } catch (err) {
      console.error("Error al cargar sedes:", err);
    }
  };

const cargarMisSolicitudes = async () => {
    try {
      const res = await fetch(`${backendUrl}/solicitudes-auto/mis-solicitudes`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await res.json();
      // Tu controlador "listarMisSolicitudes" devuelve { success: true, count, data: solicitudes }
      if (data.success) setSolicitudes(data.data);
    } catch (err) {
      console.error("Error al cargar mis solicitudes:", err);
    }
  };

  // 3. Cargar solicitudes de una sede específica para la Secretaria usando tu función "listarPorSede"
  const cargarSolicitudesPorSede = async (idSede) => {
    try {
      const res = await fetch(`${backendUrl}/solicitudes-auto/sede/${idSede}`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await res.json();
      // Tu controlador "listarPorSede" devuelve { success: true, data: solicitudes }
      if (data.success) setSolicitudes(data.data);
      
      // 4. Monitorear los autos de la sede usando tu función "getDisponibilidadSede"
      const resFlota = await fetch(`${backendUrl}/autos/disponibilidad/${idSede}`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const dataFlota = await resFlota.json();
      
      if (dataFlota.success) {

        if (Array.isArray(dataFlota.data)) {
          const autosDisponibles = dataFlota.data.filter(auto => auto.estado === 'disponible').length;
          setDisponibilidadFlota({ totalDisponible: autosDisponibles });
        } else {
          // Si tu servicio ya calculaba el entero/objeto directamente:
          setDisponibilidadFlota(dataFlota.data);
        }
      }
    } catch (err) {
      console.error("Error al cargar datos de la sede para secretaría:", err);
    }
  };

  // Enviar una nueva solicitud (Profe / Alumno)
  const handleCrearSolicitud = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ tipo: "", texto: "" });

    try {
      const res = await fetch(`${backendUrl}/solicitudes-auto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          id_sede: idSede,
          fecha_uso: fechaUso,
          hora_uso: `${horaUso}:00`,
          hora_termino: `${horaTermino}:00`,
          detalles: detalles,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMensaje({
          tipo: "success",
          texto: "Solicitud enviada exitosamente al equipo de coordinación.",
        });
        // Limpiar Formulario
        setFechaUso("");
        setHoraUso("");
        setHoraTermino("");
        setIdSede("");
        setDetalles("");
        // Recargar historial
        cargarMisSolicitudes();
      } else {
        setMensaje({
          tipo: "error",
          texto: data.message || "Error al procesar la solicitud.",
        });
      }
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: "Error de comunicación con el servidor backend.",
      });
    } finally {
      setCargando(false);
    }
  };

  // Responder a una solicitud (Secretaria - Aceptar / Rechazar)
  const handleResponderSolicitud = async (idSolicitud, nuevoEstado) => {
    if (
      nuevoEstado === "rechazado" &&
      !window.confirm("¿Estás seguro de que deseas rechazar esta solicitud?")
    )
      return;

    try {
      const res = await fetch(`${backendUrl}/solicitudes-auto/${idSolicitud}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Solicitud ${nuevoEstado} de manera correcta.`);
        cargarSolicitudesPorSede(sedeSeleccionadaFilter);
      } else {
        alert(data.message || "No se pudo cambiar el estado de la solicitud.");
      }
    } catch (err) {
      console.error("Error al actualizar solicitud:", err);
    }
  };

  // Cancelar una solicitud propia (Solo si está pendiente)
  const handleCancelarSolicitud = async (idSolicitud) => {
    if (
      !window.confirm(
        "¿Seguro que deseas cancelar esta solicitud? Se eliminará permanentemente.",
      )
    )
      return;

    try {
      const res = await fetch(`${backendUrl}/solicitudes-auto/${idSolicitud}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userToken}` },
      });

      const data = await res.json();

      if (data.success) {
        setMensaje({
          tipo: "success",
          texto: "Solicitud eliminada y cancelada con éxito.",
        });
        cargarMisSolicitudes();
      } else {
        setMensaje({
          tipo: "error",
          texto: data.message || "No se pudo realizar la acción.",
        });
      }
    } catch (err) {
      console.error("Error al cancelar:", err);
    }
  };

  // Helpers de Estilos para Estados
  const getBadgeConfig = (estado) => {
    switch (estado) {
      case "aceptado":
        return { bg: "#dcfce7", text: "#166534", label: "Aprobada" };
      case "pendiente":
        return { bg: "#fef3c7", text: "#92400e", label: "Pendiente" };
      case "rechazado":
        return { bg: "#fee2e2", text: "#991b1b", label: "Rechazada" };
      default:
        return { bg: "#e5e7eb", text: "#374151", label: "Completada" };
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#white",
        borderRadius: "12px",
        padding: "16px",
      }}
    >
      {/* SECCIÓN DE ALERTAS AL ESTILO PROPIO DEL PROYECTO */}
      {mensaje.texto && (
        <div
          style={{
            padding: "14px 20px",
            borderRadius: "8px",
            marginBottom: "24px",
            backgroundColor: mensaje.tipo === "success" ? "#dcfce7" : "#fee2e2",
            color: mensaje.tipo === "success" ? "#14532d" : "#7f1d1d",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: `1px solid ${mensaje.tipo === "success" ? "#bbf7d0" : "#fecaca"}`,
          }}
        >
          <AlertCircle size={18} />
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* ================================================================ */}
      {/* VISTA PARA CLIENTES Y TRABAJADORES (PROFESOR Y ALUMNO)            */}
      {/* ================================================================ */}
      {(userRol === "profesor" || userRol === "alumno") && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: "32px",
            alignItems: "start",
          }}
        >
          {/* LADO IZQUIERDO: FORMULARIO DE RESERVA */}
{userRol === 'alumno' && estadoMatricula !== 'finalizado' ? (
      
      // CASO A: PANTALLA DE BLOQUEO PARA ALUMNOS NO FINALIZADOS
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '48px 32px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
        border: '1px solid #f0f0f0',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '54px', marginBottom: '16px' }}>🔒</div>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', fontWeight: '700', color: '#333' }}>
          Módulo de Reserva Bloqueado
        </h3>
        <p style={{ color: '#666', fontSize: '14px', maxWidth: '460px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
          Para poder solicitar un vehículo con el fin de rendir tu examen de conducción en la municipalidad, primero debes haber completado y aprobado la totalidad de tu curso.
        </p>
        <div style={{ display: 'inline-block' }}>
          <span style={{ 
            fontSize: '12px', 
            backgroundColor: '#fef3c7', 
            color: '#92400e', 
            padding: '6px 14px', 
            borderRadius: '20px', 
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Estado de tu Curso: {estadoMatricula || 'Cargando...'}
          </span>
        </div>
      </div>

    ) : (

      // CASO B: FORMULARIO NORMAL (Profesores o Alumnos ya Finalizados)
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <Car size={26} color="#7d88d1" />
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#333' }}>
            Nueva Solicitud de Vehículo
          </h2>
        </div>

        {userRol === 'alumno' && (
          <p style={{ fontSize: '13px', color: '#666', marginTop: '-16px', marginBottom: '20px', backgroundColor: '#eff6ff', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #3b82f6' }}>
            ℹ️ Como alumno, esta solicitud está destinada para la reserva del auto de cara a tu <strong>examen de conducción municipal</strong>.
          </p>
        )}

            <form
              onSubmit={handleCrearSolicitud}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                {/* Seleccionar Fecha */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#444",
                      marginBottom: "8px",
                    }}
                  >
                    Seleccionar Fecha
                  </label>
                  <input
                    type="date"
                    value={fechaUso}
                    min={new Date().toISOString().split("T")[0]} // No permitir fechas pasadas
                    onChange={(e) => setFechaUso(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                    required
                  />
                </div>

                {/* Seleccionar Sede (Enlace directo a Base de Datos) */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#444",
                      marginBottom: "8px",
                    }}
                  >
                    Sede de Asignación
                  </label>
                  <select
                    value={idSede}
                    onChange={(e) => setIdSede(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      backgroundColor: "white",
                      boxSizing: "border-box",
                    }}
                    required
                  >
                    <option value="">Selecciona una sucursal</option>
                    {sedes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} ({s.comuna})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rango Horario */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#444",
                    marginBottom: "8px",
                  }}
                >
                  Bloque de Horario (Inicio - Término)
                </label>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <input
                    type="time"
                    value={horaUso}
                    onChange={(e) => setHoraUso(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                    }}
                    required
                  />
                  <span style={{ color: "#999", fontWeight: "bold" }}>al</span>
                  <input
                    type="time"
                    value={horaTermino}
                    onChange={(e) => setHoraTermino(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                    }}
                    required
                  />
                </div>
              </div>

              {/* Detalles / Propósito */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#444",
                    marginBottom: "8px",
                  }}
                >
                  Destino o Propósito de la Solicitud
                </label>
                <textarea
                  value={detalles}
                  onChange={(e) => setDetalles(e.target.value)}
                  placeholder="Ej: Ruta práctica San Pedro de la Paz o Examen Municipalidad Tomé..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                    minHeight: "100px",
                    resize: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Botón de Envío estilo Base Proyecto */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "8px",
                }}
              >
                <button
                  type="submit"
                  disabled={cargando}
                  style={{
                    padding: "12px 32px",
                    backgroundColor: "#7d88d1",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: cargando ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 6px rgba(125,136,209,0.2)",
                  }}
                >
                  {cargando ? "Procesando..." : "Enviar Solicitud"}
                </button>
              </div>
            </form>
          </div>
          
          {/* LADO DERECHO: HISTORIAL PREVIO  */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              border: "1px solid #f0f0f0",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "700",
                color: "#333",
                borderBottom: "2px solid #f4f4f6",
                paddingBottom: "10px",
              }}
            >
              Solicitudes Previas
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                maxHeight: "500px",
                overflowY: "auto",
                paddingRight: "4px",
              }}
            >
              {solicitudes.length === 0 ? (
                <p
                  style={{
                    color: "#999",
                    fontSize: "14px",
                    textAlign: "center",
                    margin: "20px 0",
                  }}
                >
                  No registras solicitudes en el sistema todavía.
                </p>
              ) : (
                solicitudes.map((sol) => {
                  const badge = getBadgeConfig(sol.estado);
                  return (
                    <div
                      key={sol.id}
                      style={{
                        border: "1px solid #eef0f5",
                        borderRadius: "10px",
                        padding: "16px",
                        backgroundColor: "#fbfbfd",
                        position: "relative",
                      }}
                    >
                      {/* Fila superior: Fecha y Badge */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "12px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#666",
                          }}
                        >
                          {new Date(sol.fecha_uso).toLocaleDateString("es-CL", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.text,
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: "700",
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {/* Detalles del bloque técnico */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          fontSize: "13px",
                          color: "#555",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Clock size={14} color="#7d88d1" />
                          <span>
                            {sol.hora_uso?.slice(0, 5)} -{" "}
                            {sol.hora_termino?.slice(0, 5)}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <MapPin size={14} color="#7d88d1" />
                          <span>Sede: {sol.sede?.nombre || "No asignada"}</span>
                        </div>
                        {sol.detalles && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "start",
                              gap: "8px",
                              backgroundColor: "white",
                              padding: "6px",
                              borderRadius: "4px",
                              border: "1px solid #f0f0f2",
                            }}
                          >
                            <FileText
                              size={14}
                              color="#7d88d1"
                              style={{ marginTop: "2px" }}
                            />
                            <span
                              style={{ fontSize: "12px", fontStyle: "italic" }}
                            >
                              {sol.detalles}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Botón de Cancelación Dinámica (Si está pendiente) */}
                      {sol.estado === "pendiente" && (
                        <button
                          onClick={() => handleCancelarSolicitud(sol.id)}
                          style={{
                            position: "absolute",
                            bottom: "12px",
                            right: "12px",
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            padding: "4px",
                            borderRadius: "4px",
                          }}
                          title="Cancelar Solicitud"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* VISTA CONTROL ROOM PARA COORDINADORES (SECRETARIA / ADMIN)       */}
      {/* ================================================================ */}
      {(userRol === "secretaria" || userRol === "administracion") && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Fila de Filtro de Sedes y Monitoreo Metas */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 2fr",
              gap: "24px",
              alignItems: "center",
              backgroundColor: "white",
              padding: "20px 24px",
              borderRadius: "12px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              border: "1px solid #f0f0f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Filter size={20} color="#7d88d1" />
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#666",
                    marginBottom: "4px",
                  }}
                >
                  MONITORIZAR SUCURSAL
                </label>
                <select
                  value={sedeSeleccionadaFilter}
                  onChange={(e) => setSedeSeleccionadaFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    fontSize: "14px",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">
                    -- Selecciona una Sede para evaluar peticiones --
                  </option>
                  {sedes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} ({s.comuna})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Panel de Flota del backend en Tiempo Real */}
            {disponibilidadFlota ? (
              <div
                style={{
                  backgroundColor: "#f8f9ff",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  borderLeft: "4px solid #7d88d1",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#777",
                      fontWeight: "600",
                    }}
                  >
                    CAPACIDAD OPERATIVA DE AUTOS
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "15px",
                      color: "#333",
                      fontWeight: "700",
                    }}
                  >
                    Autos listos en Sede:{" "}
                    <span style={{ color: "#7d88d1" }}>
                      {disponibilidadFlota.totalDisponible}
                    </span>
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      backgroundColor: "#e0e4f7",
                      color: "#3b4ca8",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontWeight: "bold",
                    }}
                  >
                    Flota Sincronizada
                  </span>
                </div>
              </div>
            ) : (
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#999",
                  fontStyle: "italic",
                }}
              >
                Selecciona una sucursal para ver la carga de vehículos en tiempo
                real.
              </p>
            )}
          </div>

          {/* Bandeja de Entrada de Peticiones Pendientes */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              border: "1px solid #f0f0f0",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "700",
                color: "#333",
              }}
            >
              Bandeja de Decisiones: Control de Horarios e Instructores
            </h3>

            {!sedeSeleccionadaFilter ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#999",
                  fontSize: "14px",
                }}
              >
                👉 Por favor, selecciona una sede en el filtro superior para
                desplegar la lista de solicitudes del personal y alumnos.
              </div>
            ) : solicitudes.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#999",
                  fontSize: "14px",
                }}
              >
                🙌 Al día de hoy no existen solicitudes pendientes o históricas
                en esta sede.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {solicitudes.map((sol) => {
                  const badge = getBadgeConfig(sol.estado);
                  return (
                    <div
                      key={sol.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2.5fr 1fr",
                        gap: "20px",
                        padding: "18px",
                        borderRadius: "8px",
                        border: "1px solid #eef0f6",
                        backgroundColor:
                          sol.estado === "pendiente" ? "#fdfdfd" : "#f8f9fa",
                        borderLeft: `4px solid ${sol.estado === "pendiente" ? "#7d88d1" : "#ccc"}`,
                        alignItems: "center",
                      }}
                    >
                      {/* Info de la reserva */}
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "700",
                              fontSize: "15px",
                              color: "#333",
                            }}
                          >
                            {sol.user?.email
                              ? sol.user.email.split("@")[0]
                              : "Usuario"}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              textTransform: "uppercase",
                              backgroundColor: "#e5e7eb",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontWeight: "600",
                              color: "#4b5563",
                            }}
                          >
                            {sol.tipo_solicitante}
                          </span>
                          <span
                            style={{
                              fontSize: "13px",
                              color: "#666",
                              fontWeight: "500",
                            }}
                          >
                            📅{" "}
                            {new Date(sol.fecha_uso).toLocaleDateString(
                              "es-CL",
                            )}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "16px",
                            fontSize: "13px",
                            color: "#666",
                            marginBottom: "6px",
                          }}
                        >
                          <span>
                            🕒 Bloque:{" "}
                            <strong>
                              {sol.hora_uso?.slice(0, 5)} -{" "}
                              {sol.hora_termino?.slice(0, 5)}
                            </strong>
                          </span>
                          {sol.detalles && (
                            <span>
                              📝 Propósito: <em>"{sol.detalles}"</em>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Acciones de la Secretaria */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "10px",
                        }}
                      >
                        {sol.estado === "pendiente" ? (
                          <>
                            <button
                              onClick={() =>
                                handleResponderSolicitud(sol.id, "aceptado")
                              }
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "8px 14px",
                                backgroundColor: "#22c55e",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                              }}
                            >
                              <CheckCircle2 size={16} /> Aceptar
                            </button>
                            <button
                              onClick={() =>
                                handleResponderSolicitud(sol.id, "rechazado")
                              }
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "8px 14px",
                                backgroundColor: "#ef4444",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                              }}
                            >
                              <XCircle size={16} /> Rechazar
                            </button>
                          </>
                        ) : (
                          <span
                            style={{
                              backgroundColor: badge.bg,
                              color: badge.text,
                              padding: "6px 14px",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "700",
                            }}
                          >
                            {badge.label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
