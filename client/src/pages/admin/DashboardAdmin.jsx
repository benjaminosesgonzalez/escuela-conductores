import React, { useState, useEffect } from "react";
// Modificado: Removemos la importación del archivo externo SedesView
import { FileText, Plus, Edit2, Trash2, Layers, MapPin } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import AgendarClasesSecretaria from "../secretaria/AgendarClasesSecretaria.jsx";
import InicioView from "../secretaria/InicioView.jsx";
import AlumnosView from "../secretaria/AlumnosView.jsx";
import Interesados from "../secretaria/Interesados.jsx";
import ProfesoresView from "../secretaria/ProfesoresView.jsx";
import SalaPsicotecnicaView from "../secretaria/SalaPsicotecnicaView.jsx";
import VehiculosView from "../secretaria/VehiculosView.jsx";
import { Card, Button } from "../../components/shared/index.js";
import { colors, spacing } from "../../theme/index.js";
import { authService } from "../../services/authService.js";
import SecretariasView from "./SecretariasView.jsx";

const DashboardAdmin = () => {
  const [activeTab, setActiveTab] = useState("inicio");

  // Datos Globales Compartidos
  const [alumnos, setAlumnos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [sedesDisponibles, setSedesDisponibles] = useState([]);
  const [seccionActual, setSeccionActual] = useState("planes");
  const [autos, setAutos] = useState([]);
  const [statsData, setStatsData] = useState({
    totalAlumnos: 0,
    totalProfesores: 0,
    totalAutos: 0,
  });

  const currentUser = authService.getCurrentUser();
  const adminNombre = currentUser?.nombre || "Administrador";
  const [secretarias, setSecretarias] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = authService.getToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [alumnosRes, profesRes, autosRes, sedesRes, secretariasRes] = await Promise.all([
          fetch("http://localhost:5000/api/alumnos", { headers }),
          fetch("http://localhost:5000/api/profesores", { headers }),
          fetch("http://localhost:5000/api/autos", { headers }),
          fetch("http://localhost:5000/api/sedes", { headers }),
          fetch("http://localhost:5000/api/secretarias", { headers })
        ]);

        const alumnosData = await alumnosRes.json();
        const profesData = await profesRes.json();
        const autosData = await autosRes.json();

        if (alumnosData.success) {
          setAlumnos(alumnosData.data);
          setStatsData((prev) => ({
            ...prev,
            totalAlumnos: alumnosData.data.length,
          }));
        }

        if (profesData.success) {
          setProfesores(profesData.data);
          setStatsData((prev) => ({
            ...prev,
            totalProfesores: profesData.data.length,
          }));
        }

        if (autosData.success) {
          setAutos(autosData.data);
          setStatsData((prev) => ({
            ...prev,
            totalAutos: autosData.data.length,
          }));
        }

        if (sedesRes.ok) {
          const sedesData = await sedesRes.json();
          if (sedesData.success) setSedesDisponibles(sedesData.data);
        }

        if (secretariasRes.ok) {
          const secretariasData = await secretariasRes.json();
          if (secretariasData.success) {
            setSecretarias(secretariasData.data);
          }
        }
      } catch (error) {
        console.error("Error cargando la data del administrador:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "inicio" && (
        <InicioView
          secretariaNombre={adminNombre}
          statsData={statsData}
          setActiveTab={setActiveTab}
          sedesDisponibles={sedesDisponibles}
        />
      )}

      {activeTab === "alumnos" && (
        <AlumnosView
          alumnos={alumnos}
          setAlumnos={setAlumnos}
          sedesDisponibles={sedesDisponibles}
          setStatsData={setStatsData}
        />
      )}

      {activeTab === "profesores" && (
        <ProfesoresView
          profesores={profesores}
          setProfesores={setProfesores}
          sedesDisponibles={sedesDisponibles}
        />
      )}

      {activeTab === "secretarias" && (
        <SecretariasView 
          secretarias={secretarias} 
          setSecretarias={setSecretarias} 
        />
      )}

      {activeTab === "psicotecnico" && <SalaPsicotecnicaView />}

      {activeTab === "vehiculos" && (
        <VehiculosView
          autos={autos}
          setAutos={setAutos}
          sedesDisponibles={sedesDisponibles}
          setStatsData={setStatsData}
        />
      )}

      {activeTab === "agendar-clases" && <AgendarClasesSecretaria />}
      {activeTab === "interesados" && <Interesados />}

      {/* MÓDULO GESTIÓN DE PLANES */}
      {activeTab === "planes" && <PlanesView />}

      {/* 🚀 MÓDULO GESTIÓN DE SEDES LOCAL (UNIFICADO) */}
      {activeTab === "sedes" && <SedesView />}

      {(activeTab === "reportes" || activeTab === "configuracion") && (
        <Card title={activeTab.toUpperCase()} icon={FileText}>
          <p
            style={{
              color: colors.textSecondary,
              textAlign: "center",
              padding: spacing.padding.xlarge,
            }}
          >
            Módulo en desarrollo
          </p>
        </Card>
      )}
    </AdminLayout>
  );
};

// ============================================================================
// SUBCOMPONENTE: SEDESVIEW (CRUD DE SEDES REAJUSTADO A COMUNA)
// ============================================================================
const SedesView = () => {
  const [sedes, setSedes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    comuna: "",
  });

  const backendUrl = "http://localhost:5000/api/sedes";

  const fetchSedes = () => {
    setCargando(true);
    const token = authService.getToken();

    fetch(backendUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setSedes(data.data);
        } else if (Array.isArray(data)) {
          setSedes(data);
        }
      })
      .catch((err) => console.error("Error leyendo sedes:", err))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = authService.getToken();
    const url = editandoId ? `${backendUrl}/${editandoId}` : backendUrl;
    const method = editandoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: form.nombre,
          direccion: form.direccion,
          comuna: form.comuna,
        }),
      });

      const data = await res.json();

      if (data.success || res.ok) {
        alert(editandoId ? "Sede actualizada" : "Sede creada con éxito");
        limpiarFormulario();
        fetchSedes();
      } else {
        alert("Error del servidor: " + (data.message || "Error desconocido"));
      }
    } catch (err) {
      console.error("Error al guardar sede:", err);
    }
  };

  const handleEliminar = async (id, nombreSede) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la sede "${nombreSede}"?`))
      return;
    const token = authService.getToken();
    try {
      const res = await fetch(`${backendUrl}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Sede eliminada del sistema");
        fetchSedes();
      }
    } catch (err) {
      console.error("Error al eliminar sede:", err);
    }
  };

  const activarEdicion = (sede) => {
    setEditandoId(sede.id);
    setForm({
      nombre: sede.nombre,
      direccion: sede.direccion,
      comuna: sede.comuna || "",
    });
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setForm({ nombre: "", direccion: "", comuna: "" });
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr",
        gap: "24px",
        alignItems: "start",
      }}
    >
      {/* Formulario Izquierda */}
      <Card
        title={editandoId ? "Editar Sede Académica" : "Registrar Nueva Sede"}
        icon={MapPin}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            padding: "8px",
          }}
        >
          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre de la Sede</label>
            <input
              name="nombre"
              type="text"
              placeholder="Ej: Concepción Centro o DEM Tomé"
              value={form.nombre}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Dirección Física</label>
            <input
              name="direccion"
              type="text"
              placeholder="Ej: Aníbal Pinto 455"
              value={form.direccion}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Comuna</label>
            <input
              name="comuna"
              type="text"
              placeholder="Ej: Tomé, Concepción, Penco"
              value={form.comuna}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "10px",
            }}
          >
            {editandoId && (
              <Button
                type="button"
                onClick={limpiarFormulario}
                style={{ backgroundColor: "#718096" }}
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" style={{ backgroundColor: "#ff6b35" }}>
              {editandoId ? "Actualizar Sede" : "Crear Sede"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Grilla Derecha */}
      <Card title="Sedes de la Escuela Activas" icon={MapPin}>
        {cargando ? (
          <p style={{ textAlign: "center", color: "#666" }}>
            Sincronizando sedes con el backend...
          </p>
        ) : sedes.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999" }}>
            No hay sedes registradas.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid #edf2f7",
                    color: "#4a5568",
                    fontWeight: "700",
                  }}
                >
                  <th style={{ padding: "12px" }}>ID</th>
                  <th style={{ padding: "12px" }}>Nombre Sede</th>
                  <th style={{ padding: "12px" }}>Dirección</th>
                  <th style={{ padding: "12px" }}>Comuna</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {sedes.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #edf2f7" }}>
                    <td
                      style={{
                        padding: "12px",
                        fontFamily: "monospace",
                        color: "#ff6b35",
                      }}
                    >
                      {s.id}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        fontWeight: "600",
                        color: "#2c3e8f",
                      }}
                    >
                      {s.nombre}
                    </td>
                    <td style={{ padding: "12px", color: "#555" }}>
                      {s.direccion}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        color: "#718096",
                        textTransform: "capitalize",
                      }}
                    >
                      {s.comuna || "—"}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          onClick={() => activarEdicion(s)}
                          style={styles.actionBtn}
                          title="Editar Sede"
                        >
                          <Edit2 size={15} color="#4c5fd5" />
                        </button>
                        <button
                          onClick={() => handleEliminar(s.id, s.nombre)}
                          style={styles.actionBtn}
                          title="Eliminar Sede"
                        >
                          <Trash2 size={15} color="#e53e3e" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

// ============================================================================
// SUBCOMPONENTE: PLANESVIEW (CRUD OPERATIVO SANITIZADO)
// ============================================================================
const PlanesView = () => {
  const [planes, setPlanes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    precio: "",
    clases_practicas: "",
    nivel_teorico: "Básico",
    clases_simulador: "",
  });

  const backendUrl = "http://localhost:5000/api/plans";

  const fetchPlanes = () => {
    setCargando(true);
    const token = authService.getToken();

    fetch(backendUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("🔴 RESPUESTA LECTURA PLANES:", data);
        if (data && Array.isArray(data.data)) {
          setPlanes(data.data);
        } else if (Array.isArray(data)) {
          setPlanes(data);
        }
      })
      .catch((err) => console.error("Error leyendo planes:", err))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = authService.getToken();
    const url = editandoId ? `${backendUrl}/${editandoId}` : backendUrl;
    const method = editandoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: form.nombre,
          precio: Number(form.precio),
          clases_practicas: Number(form.clases_practicas),
          nivel_teorico: form.nivel_teorico,
          clases_simulador: Number(form.clases_simulador),
        }),
      });

      const data = await res.json();
      console.log("🟢 RESPUESTA INTENTO DE GUARDADO:", data);

      if (data.success || res.ok) {
        alert(
          editandoId
            ? "Plan actualizado con éxito"
            : "Nuevo plan creado con éxito",
        );
        limpiarFormulario();
        fetchPlanes();
      } else {
        alert(
          "El servidor rechazó la operación: " +
            (data.message || "Error desconocido"),
        );
      }
    } catch (err) {
      console.error("Error al guardar plan:", err);
    }
  };

  const handleEliminar = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar permanentemente este plan?",
      )
    )
      return;
    const token = authService.getToken();
    try {
      const res = await fetch(`${backendUrl}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Plan removido del catálogo");
        fetchPlanes();
      }
    } catch (err) {
      console.error("Error al eliminar plan:", err);
    }
  };

  const handleToggleInscripciones = async (id) => {
    const token = authService.getToken();
    try {
      const res = await fetch(`${backendUrl}/${id}/toggle-enrollment`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      console.log("🔄 RESPUESTA TOGGLE INSCRIPCIONES:", data);

      if (data.success && data.data) {
        setPlanes((prevPlanes) =>
          prevPlanes.map((plan) =>
            plan.id === id
              ? {
                  ...plan,
                  inscripciones_abiertas: data.data.inscripciones_abiertas,
                }
              : plan,
          ),
        );
      } else {
        alert(
          "Error al modificar inscripciones: " +
            (data.message || "Error desconocido"),
        );
      }
    } catch (err) {
      console.error("Error al mutar el estado del plan:", err);
      alert("Hubo un error de conexión al intentar cambiar el estado.");
    }
  };

  const activarEdicion = (plan) => {
    setEditandoId(plan.id);
    setForm({
      nombre: plan.nombre,
      precio: plan.precio,
      clases_practicas: plan.clases_practicas,
      nivel_teorico: plan.nivel_teorico,
      clases_simulador: plan.clases_simulador,
    });
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setForm({
      nombre: "",
      precio: "",
      clases_practicas: "",
      nivel_teorico: "Básico",
      clases_simulador: "",
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <Card
        title={
          editandoId
            ? "Editar Plan de Conducción"
            : "Crear Nuevo Plan de Conducción"
        }
        icon={Layers}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
            padding: "8px",
          }}
        >
          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre Comercial</label>
            <input
              name="nombre"
              type="text"
              placeholder="Ej: Plan Intermedio"
              value={form.nombre}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Precio (CLP)</label>
            <input
              name="precio"
              type="number"
              placeholder="Ej: 150000"
              value={form.precio}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Clases Prácticas</label>
            <input
              name="clases_practicas"
              type="number"
              placeholder="Ej: 10"
              value={form.clases_practicas}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nivel Teórico</label>
            <select
              name="nivel_teorico"
              value={form.nivel_teorico}
              onChange={handleInputChange}
              style={styles.select}
            >
              <option value="Básico">Básico</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </div>

          <div style={{ ...styles.formGroup, gridColumn: "span 2" }}>
            <label style={styles.label}>Clases de Simulador</label>
            <input
              name="clases_simulador"
              type="number"
              placeholder="Ej: 4"
              value={form.clases_simulador}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
          </div>

          <div
            style={{
              gridColumn: "span 2",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "10px",
            }}
          >
            {editandoId && (
              <Button
                type="button"
                onClick={limpiarFormulario}
                style={{ backgroundColor: "#718096" }}
              >
                Cancelar Edición
              </Button>
            )}
            <Button type="submit" style={{ backgroundColor: "#ff6b35" }}>
              {editandoId ? "Actualizar Cambios" : "Publicar Plan"}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Catálogo de Oferta Académica Actual" icon={Layers}>
        {cargando ? (
          <p style={{ textAlign: "center", color: "#666" }}>
            Sincronizando catálogo con el backend...
          </p>
        ) : planes.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999" }}>
            No hay planes de conducción registrados en el system.
          </p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid #edf2f7",
                  color: "#4a5568",
                  fontWeight: "700",
                }}
              >
                <th style={{ padding: "12px" }}>ID</th>
                <th style={{ padding: "12px" }}>Nombre</th>
                <th style={{ padding: "12px" }}>Precio</th>
                <th style={{ padding: "12px" }}>C. Prácticas</th>
                <th style={{ padding: "12px" }}>Teórico</th>
                <th style={{ padding: "12px" }}>Simulador</th>
                <th style={{ padding: "12px", textAlign: "center" }}>
                  Inscripciones
                </th>
                <th style={{ padding: "12px", textAlign: "right" }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {planes.map((plan) => (
                <tr key={plan.id} style={{ borderBottom: "1px solid #edf2f7" }}>
                  <td
                    style={{
                      padding: "12px",
                      fontFamily: "monospace",
                      color: "#e53e3e",
                    }}
                  >
                    {plan.id}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      fontWeight: "600",
                      color: "#2c3e8f",
                    }}
                  >
                    {plan.nombre}
                  </td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>
                    ${plan.precio?.toLocaleString("es-CL")}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {plan.clases_practicas} sesiones
                  </td>
                  <td style={{ padding: "12px" }}>{plan.nivel_teorico}</td>
                  <td style={{ padding: "12px" }}>
                    {plan.clases_simulador} bloques
                  </td>

                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      onClick={() => handleToggleInscripciones(plan.id)}
                      style={{
                        backgroundColor:
                          plan.inscripciones_abiertas !== false
                            ? "#c6f6d5"
                            : "#fed7d7",
                        color:
                          plan.inscripciones_abiertas !== false
                            ? "#22543d"
                            : "#742a2a",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        minWidth: "85px",
                      }}
                      title={
                        plan.inscripciones_abiertas !== false
                          ? "Haga clic para cerrar"
                          : "Haga clic para abrir"
                      }
                    >
                      {plan.inscripciones_abiertas !== false
                        ? "Abiertas 🔓"
                        : "Cerradas 🔒"}
                    </button>
                  </td>

                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        onClick={() => activarEdicion(plan)}
                        style={styles.actionBtn}
                        title="Editar Plan"
                      >
                        <Edit2 size={15} color="#4c5fd5" />
                      </button>
                      <button
                        onClick={() => handleEliminar(plan.id)}
                        style={styles.actionBtn}
                        title="Eliminar Plan"
                      >
                        <Trash2 size={15} color="#e53e3e" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

const styles = {
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "700", color: "#2c3e8f" },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #cbd5e0",
    fontSize: "14px",
    outline: "none",
  },
  select: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #cbd5e0",
    fontSize: "14px",
    cursor: "pointer",
    outline: "none",
    backgroundColor: "white",
  },
  actionBtn: {
    background: "#f7fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    padding: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
};

export default DashboardAdmin;
