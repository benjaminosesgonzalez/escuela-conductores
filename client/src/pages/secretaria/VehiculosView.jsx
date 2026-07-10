import React, { useState, useEffect } from "react";
// 🚀 NUEVO: Importamos el ícono Clock para ver los horarios
import {
  Car,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  List,
  Activity,
  Clock,
} from "lucide-react";
import { Card, Button } from "../../components/shared/index.js";
import { colors, spacing } from "../../theme/index.js";
import { authService } from "../../services/authService.js";

const VehiculosView = ({ autos, setAutos, sedesDisponibles, setStatsData }) => {
  const [subTab, setSubTab] = useState("inventario"); // 'inventario', 'crear', 'editar', 'solicitudes'

  // ESTADOS PARA INVENTARIO
  const [autoEditando, setAutoEditando] = useState(null);
  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    patente: "",
    anio: "",
    estado: "disponible",
    id_sede: "",
  });

  // ESTADOS PARA SOLICITUDES
  const [solicitudes, setSolicitudes] = useState([]);
  const [sedeFiltroSolicitud, setSedeFiltroSolicitud] = useState("");
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);

  const [modalAsignacion, setModalAsignacion] = useState(null); // Guarda la solicitud que se está aprobando
  const [autosDisponiblesModal, setAutosDisponiblesModal] = useState([]);
  const [autoSeleccionadoId, setAutoSeleccionadoId] = useState("");
  const [cargandoAutos, setCargandoAutos] = useState(false);

  // 🚀 NUEVOS ESTADOS: Para controlar el visor de horarios del auto
  const [modalHorarios, setModalHorarios] = useState(null); // Almacena el objeto del auto seleccionado
  const [horariosVehiculo, setHorariosVehiculo] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  // --- LÓGICA DE INVENTARIO (CRUD) ---
  const handleCrearAuto = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/autos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({ ...formData, anio: parseInt(formData.anio) }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Vehículo ingresado correctamente");
        recargarAutos();
        setSubTab("inventario");
      } else {
        alert(data.error || data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditarAuto = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5000/api/autos/${autoEditando.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authService.getToken()}`,
          },
          body: JSON.stringify({ ...formData, anio: parseInt(formData.anio) }),
        },
      );
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        recargarAutos();
        setSubTab("inventario");
      } else {
        alert(data.error || data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEliminarAuto = async (id) => {
    if (!window.confirm("¿Estás segura de eliminar este vehículo de la flota?"))
      return;
    try {
      const response = await fetch(`http://localhost:5000/api/autos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authService.getToken()}` },
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        recargarAutos();
      } else {
        alert(data.error || data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const recargarAutos = async () => {
    const res = await fetch("http://localhost:5000/api/autos", {
      headers: { Authorization: `Bearer ${authService.getToken()}` },
    });
    const data = await res.json();
    if (data.success) {
      setAutos(data.data);
      setStatsData((prev) => ({ ...prev, totalAutos: data.data.length }));
    }
  };

  // --- LÓGICA DE SOLICITUDES ---
  const fetchSolicitudes = async (idSede) => {
    if (!idSede) {
      setSolicitudes([]);
      return;
    }
    setLoadingSolicitudes(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/solicitudes-auto/sede/${idSede}`,
        {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        },
      );
      const data = await res.json();
      const lista = data.data || data;
      if (Array.isArray(lista)) {
        setSolicitudes(lista);
      } else if (data.success && Array.isArray(data.data)) {
        setSolicitudes(data.data);
      } else {
        setSolicitudes([]);
      }
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  useEffect(() => {
    if (subTab === "solicitudes") fetchSolicitudes(sedeFiltroSolicitud);
  }, [sedeFiltroSolicitud, subTab]);

  const abrirModalAsignacion = async (solicitud) => {
    setModalAsignacion(solicitud);
    setAutoSeleccionadoId("");
    setCargandoAutos(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/solicitudes-auto/${solicitud.id}/autos-disponibles`,
        {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        setAutosDisponiblesModal(data.data);
      }
    } catch (error) {
      console.error("Error cargando autos libres:", error);
    } finally {
      setCargandoAutos(false);
    }
  };

  const handleResponderSolicitud = async (
    idSolicitud,
    estadoAccion,
    idAuto = null,
  ) => {
    if (
      estadoAccion === "rechazado" &&
      !window.confirm(`¿Confirmas que deseas rechazar esta solicitud?`)
    )
      return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/solicitudes-auto/${idSolicitud}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authService.getToken()}`,
          },
          body: JSON.stringify({ estado: estadoAccion, id_auto: idAuto }),
        },
      );
      const data = await response.json();
      if (response.ok) {
        alert(`Solicitud ${estadoAccion} correctamente`);
        setModalAsignacion(null);
        fetchSolicitudes(sedeFiltroSolicitud); // Recargar
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const abrirModalHorarios = async (auto) => {
    setModalHorarios(auto);
    setHorariosVehiculo([]);

    // Rescatamos el ID de la sede a la que pertenece el vehículo
    const idSede = auto.id_sede || auto.sede?.id;

    // Si el auto no tiene sede asignada, es imposible que tenga solicitudes
    if (!idSede) return;

    setCargandoHorarios(true);
    try {
      console.log(
        `📡 Consultando agenda reutilizando el endpoint de la Sede: ${idSede}`,
      );

      // Llamamos al endpoint que SÍ está operativo y funcional en tu backend
      const res = await fetch(
        `http://localhost:5000/api/solicitudes-auto/sede/${idSede}`,
        {
          headers: { Authorization: `Bearer ${authService.getToken()}` },
        },
      );
      const data = await res.json();
      const lista = data.data || data;

      if (Array.isArray(lista)) {
        // 🎯 FILTRADO MAESTRO:
        // 1. Que la solicitud esté 'aceptada'
        // 2. Que el auto asignado coincida exactamente con el ID de este auto
        const ocupados = lista.filter(
          (sol) =>
            sol.estado === "aceptado" &&
            (Number(sol.id_auto) === Number(auto.id) ||
              Number(sol.auto?.id) === Number(auto.id)),
        );

        setHorariosVehiculo(ocupados);
      }
    } catch (error) {
      console.error("Error cargando la agenda del vehículo:", error);
    } finally {
      setCargandoHorarios(false);
    }
  };

  return (
    <div>
      {/* BARRA DE NAVEGACIÓN INTERNA */}
      <div
        style={{
          display: "flex",
          gap: spacing.gap.normal,
          marginBottom: spacing.margin.large,
        }}
      >
        <Button
          onClick={() => setSubTab("inventario")}
          style={{
            backgroundColor:
              subTab === "inventario" ? colors.secretaria : colors.background,
            color: subTab === "inventario" ? "white" : colors.textPrimary,
          }}
        >
          <Car size={18} style={{ marginRight: "8px", display: "inline" }} />{" "}
          Inventario de Flota
        </Button>
        <Button
          onClick={() => {
            setFormData({
              marca: "",
              modelo: "",
              patente: "",
              anio: "",
              estado: "disponible",
              id_sede: "",
            });
            setSubTab("crear");
          }}
          style={{
            backgroundColor:
              subTab === "crear" ? colors.secretaria : colors.background,
            color: subTab === "crear" ? "white" : colors.textPrimary,
          }}
        >
          <Plus size={18} style={{ marginRight: "8px", display: "inline" }} />{" "}
          Ingresar Vehículo
        </Button>
        <Button
          onClick={() => setSubTab("solicitudes")}
          style={{
            backgroundColor:
              subTab === "solicitudes" ? colors.secretaria : colors.background,
            color: subTab === "solicitudes" ? "white" : colors.textPrimary,
          }}
        >
          <List size={18} style={{ marginRight: "8px", display: "inline" }} />{" "}
          Solicitudes de Asignación
        </Button>
      </div>

      {/* VISTA 1: INVENTARIO */}
      {subTab === "inventario" && (
        <Card title="Inventario Global de Vehículos" icon={Car}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: `2px solid ${colors.borderLight}`,
                  color: colors.textSecondary,
                }}
              >
                <th style={{ padding: "12px" }}>Patente</th>
                <th style={{ padding: "12px" }}>Marca / Modelo</th>
                <th style={{ padding: "12px" }}>Año</th>
                <th style={{ padding: "12px" }}>Estado</th>
                <th style={{ padding: "12px" }}>Sede</th>
                <th style={{ padding: "12px", textAlign: "right" }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {autos.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: colors.textSecondary,
                    }}
                  >
                    No hay vehículos registrados.
                  </td>
                </tr>
              ) : (
                autos.map((auto) => (
                  <tr
                    key={auto.id}
                    style={{ borderBottom: `1px solid ${colors.borderLight}` }}
                  >
                    <td style={{ padding: "12px", fontWeight: "bold" }}>
                      {auto.patente}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {auto.marca} {auto.modelo}
                    </td>
                    <td style={{ padding: "12px" }}>{auto.anio}</td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          backgroundColor:
                            auto.estado === "disponible"
                              ? "#dcfce7"
                              : auto.estado === "mantenimiento"
                                ? "#fef08a"
                                : "#fee2e2",
                          color:
                            auto.estado === "disponible"
                              ? "#166534"
                              : auto.estado === "mantenimiento"
                                ? "#854d0e"
                                : "#991b1b",
                        }}
                      >
                        {auto.estado.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      {auto.sede ? (
                        auto.sede.nombre
                      ) : (
                        <span style={{ color: colors.error }}>Sin sede</span>
                      )}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          justifyContent: "flex-end",
                        }}
                      >
                        {/* 🚀 NUEVO BOTÓN: Ver Horarios del Auto */}
                        <button
                          onClick={() => abrirModalHorarios(auto)}
                          title="Ver Agenda / Horarios de Uso"
                          style={{
                            cursor: "pointer",
                            border: "none",
                            background: "none",
                            color: "#ff6b35",
                          }}
                        >
                          <Clock size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setAutoEditando(auto);
                            setFormData({
                              ...auto,
                              id_sede: auto.sede?.id || "",
                            });
                            setSubTab("editar");
                          }}
                          style={{
                            cursor: "pointer",
                            border: "none",
                            background: "none",
                            color: colors.secretaria,
                          }}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleEliminarAuto(auto.id)}
                          style={{
                            cursor: "pointer",
                            border: "none",
                            background: "none",
                            color: "#ef4444",
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}

      {/* VISTA 2: FORMULARIO CREAR/EDITAR */}
      {(subTab === "crear" || subTab === "editar") && (
        <Card
          title={
            subTab === "editar" ? "Editar Vehículo" : "Ingresar Nuevo Vehículo"
          }
          icon={subTab === "editar" ? Edit : Plus}
        >
          <form
            onSubmit={subTab === "editar" ? handleEditarAuto : handleCrearAuto}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: spacing.gap.large,
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label>Patente</label>
              <input
                required
                type="text"
                value={formData.patente}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    patente: e.target.value.toUpperCase(),
                  })
                }
                placeholder="Ej: ABCD12"
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: `1px solid ${colors.borderLight}`,
                }}
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label>Marca</label>
              <input
                required
                type="text"
                value={formData.marca}
                onChange={(e) =>
                  setFormData({ ...formData, marca: e.target.value })
                }
                placeholder="Ej: Kia"
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: `1px solid ${colors.borderLight}`,
                }}
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label>Modelo</label>
              <input
                required
                type="text"
                value={formData.modelo}
                onChange={(e) =>
                  setFormData({ ...formData, modelo: e.target.value })
                }
                placeholder="Ej: Morning"
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: `1px solid ${colors.borderLight}`,
                }}
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label>Año</label>
              <input
                required
                type="number"
                min="1990"
                max="2030"
                value={formData.anio}
                onChange={(e) =>
                  setFormData({ ...formData, anio: e.target.value })
                }
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: `1px solid ${colors.borderLight}`,
                }}
              />
            </div>

            {subTab === "editar" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label>Estado Técnico</label>
                <select
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData({ ...formData, estado: e.target.value })
                  }
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    border: `1px solid ${colors.borderLight}`,
                    backgroundColor: "white",
                  }}
                >
                  <option value="disponible">Disponible / Operativo</option>
                  <option value="mantenimiento">En Mantención</option>
                </select>
              </div>
            )}

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label>Sede Asignada</label>
              <select
                required
                value={formData.id_sede}
                onChange={(e) =>
                  setFormData({ ...formData, id_sede: e.target.value })
                }
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: `1px solid ${colors.borderLight}`,
                  backgroundColor: "white",
                }}
              >
                <option value="">Seleccione una sede...</option>
                {sedesDisponibles.map((sede) => (
                  <option key={sede.id} value={sede.id}>
                    {sede.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                gridColumn: "span 2",
                display: "flex",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <Button
                type="submit"
                style={{ backgroundColor: colors.secretaria }}
              >
                Guardar Vehículo
              </Button>
              <Button
                type="button"
                onClick={() => setSubTab("inventario")}
                style={{ backgroundColor: "#64748b" }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* VISTA 3: SOLICITUDES DE ASIGNACIÓN */}
      {subTab === "solicitudes" && (
        <Card title="Gestión de Solicitudes de Vehículos" icon={Activity}>
          <div
            style={{
              marginBottom: spacing.margin.large,
              padding: "15px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: `1px solid ${colors.borderLight}`,
            }}
          >
            <label style={{ fontWeight: "bold", marginRight: "15px" }}>
              Selecciona una Sede para ver sus solicitudes:
            </label>
            <select
              value={sedeFiltroSolicitud}
              onChange={(e) => setSedeFiltroSolicitud(e.target.value)}
              style={{ padding: "8px", borderRadius: "6px", minWidth: "200px" }}
            >
              <option value="">Elegir Sede...</option>
              {sedesDisponibles.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre}
                </option>
              ))}
            </select>
          </div>

          {!sedeFiltroSolicitud ? (
            <p style={{ textAlign: "center", color: colors.textSecondary }}>
              Por favor, selecciona una sede arriba para comenzar.
            </p>
          ) : loadingSolicitudes ? (
            <p style={{ textAlign: "center", color: colors.textTertiary }}>
              Cargando solicitudes...
            </p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: `2px solid ${colors.borderLight}`,
                    color: colors.textSecondary,
                  }}
                >
                  <th style={{ padding: "12px" }}>Fecha Uso</th>
                  <th style={{ padding: "12px" }}>Horario</th>
                  <th style={{ padding: "12px" }}>Solicitante</th>
                  <th style={{ padding: "12px" }}>Estado</th>
                  <th style={{ padding: "12px" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: colors.textSecondary,
                      }}
                    >
                      No hay solicitudes para esta sede.
                    </td>
                  </tr>
                ) : (
                  solicitudes.map((sol) => (
                    <tr
                      key={sol.id}
                      style={{
                        borderBottom: `1px solid ${colors.borderLight}`,
                      }}
                    >
                      <td style={{ padding: "12px", fontWeight: "bold" }}>
                        {sol.fecha_uso}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {sol.hora_uso} a {sol.hora_termino}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            textTransform: "capitalize",
                            fontWeight: "bold",
                            color:
                              sol.tipo_solicitante === "profesor"
                                ? "#10b981"
                                : "#3b82f6",
                          }}
                        >
                          {sol.tipo_solicitante}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            backgroundColor:
                              sol.estado === "pendiente"
                                ? "#fef08a"
                                : sol.estado === "aceptado"
                                  ? "#dcfce7"
                                  : "#fee2e2",
                            color:
                              sol.estado === "pendiente"
                                ? "#854d0e"
                                : sol.estado === "aceptado"
                                  ? "#166534"
                                  : "#991b1b",
                          }}
                        >
                          {sol.estado.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {sol.estado === "pendiente" ? (
                          <div style={{ display: "flex", gap: "10px" }}>
                            <button
                              onClick={() => abrirModalAsignacion(sol)}
                              title="Asignar Vehículo"
                              style={{
                                cursor: "pointer",
                                border: "none",
                                background: "none",
                                color: "#10b981",
                              }}
                            >
                              <CheckCircle size={22} />
                            </button>
                            <button
                              onClick={() =>
                                handleResponderSolicitud(sol.id, "rechazado")
                              }
                              title="Rechazar (Sin cupo)"
                              style={{
                                cursor: "pointer",
                                border: "none",
                                background: "none",
                                color: "#ef4444",
                              }}
                            >
                              <XCircle size={22} />
                            </button>
                          </div>
                        ) : (
                          <span
                            style={{
                              color: colors.textTertiary,
                              fontSize: "12px",
                            }}
                          >
                            Procesada
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* --- MODAL DE ASIGNACIÓN --- */}
      {modalAsignacion && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "8px",
              width: "400px",
              maxWidth: "90%",
            }}
          >
            <h3 style={{ marginTop: 0, color: colors.textPrimary }}>
              Asignar Vehículo
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: colors.textSecondary,
                marginBottom: "16px",
              }}
            >
              Solicitud de {modalAsignacion.fecha_uso} (
              {modalAsignacion.hora_uso} - {modalAsignacion.hora_termino})
            </p>

            {cargandoAutos ? (
              <p style={{ textAlign: "center", color: colors.secretaria }}>
                Buscando autos libres...
              </p>
            ) : autosDisponiblesModal.length === 0 ? (
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: "6px",
                  fontSize: "14px",
                  marginBottom: "16px",
                }}
              >
                No hay vehículos disponibles en esta sede que cumplan con el
                horario (considerando 1 hora de holgura).
              </div>
            ) : (
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  Selecciona un auto libre:
                </label>
                <select
                  value={autoSeleccionadoId}
                  onChange={(e) => setAutoSeleccionadoId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: `1px solid ${colors.borderLight}`,
                  }}
                >
                  <option value="">Elegir vehículo...</option>
                  {autosDisponiblesModal.map((auto) => (
                    <option key={auto.id} value={auto.id}>
                      {auto.marca} {auto.modelo} - Patente: {auto.patente}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <Button
                type="button"
                onClick={() => setModalAsignacion(null)}
                style={{ backgroundColor: "#64748b" }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={!autoSeleccionadoId}
                onClick={() =>
                  handleResponderSolicitud(
                    modalAsignacion.id,
                    "aceptado",
                    autoSeleccionadoId,
                  )
                }
                style={{ backgroundColor: colors.success }}
              >
                Confirmar Asignación
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 --- MODAL NUEVO: VISOR DE HORARIOS / AGENDA DE USO --- */}
      {modalHorarios && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "8px",
              width: "500px",
              maxWidth: "95%",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: colors.textPrimary,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Clock size={20} color="#ff6b35" /> Agenda de Ocupación
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#4a5568",
                marginBottom: "16px",
                fontWeight: "600",
              }}
            >
              Vehículo:{" "}
              <span style={{ color: colors.secretaria }}>
                {modalHorarios.marca} {modalHorarios.modelo}
              </span>{" "}
              | Patente:{" "}
              <span
                style={{
                  fontFamily: "monospace",
                  background: "#f1f5f9",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {modalHorarios.patente}
              </span>
            </p>

            <div
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                marginBottom: "20px",
                border: `1px solid ${colors.borderLight}`,
                borderRadius: "6px",
              }}
            >
              {cargandoHorarios ? (
                <p
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: colors.textTertiary,
                  }}
                >
                  Consultando bitácora de rutas...
                </p>
              ) : horariosVehiculo.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#94a3b8",
                    fontSize: "14px",
                  }}
                >
                  Este vehículo no registra horarios de uso asignados para los
                  próximos días. ¡Flota libre!
                </p>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                    textAlign: "left",
                  }}
                >
                  <thead
                    style={{
                      backgroundColor: "#f8fafc",
                      position: "sticky",
                      top: 0,
                    }}
                  >
                    <tr
                      style={{
                        borderBottom: `1px solid ${colors.borderLight}`,
                        color: colors.textSecondary,
                      }}
                    >
                      <th style={{ padding: "10px" }}>Fecha</th>
                      <th style={{ padding: "10px" }}>Bloque Horario</th>
                      <th style={{ padding: "10px" }}>Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horariosVehiculo.map((horario) => (
                      <tr
                        key={horario.id}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td style={{ padding: "10px", fontWeight: "bold" }}>
                          {horario.fecha_uso}
                        </td>
                        <td style={{ padding: "10px", color: "#334155" }}>
                          {horario.hora_uso} - {horario.hora_termino}
                        </td>
                        <td style={{ padding: "10px" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              textTransform: "uppercase",
                              fontWeight: "700",
                              backgroundColor:
                                horario.tipo_solicitante === "profesor"
                                  ? "#e0f2fe"
                                  : "#fef3c7",
                              color:
                                horario.tipo_solicitante === "profesor"
                                  ? "#0369a1"
                                  : "#b45309",
                            }}
                          >
                            {horario.tipo_solicitante}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="button"
                onClick={() => setModalHorarios(null)}
                style={{ backgroundColor: "#64748b", width: "100%" }}
              >
                Cerrar Agenda
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiculosView;
