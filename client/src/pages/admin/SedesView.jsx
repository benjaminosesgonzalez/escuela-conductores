import React, { useEffect, useState } from "react";
import { MapPin, Edit2, Trash2 } from "lucide-react";
import { Card, Button } from "../../components/shared/index.js";
import { colors, spacing } from "../../theme/index.js";
import { authService } from "../../services/authService.js";

const SedesView = () => {
  const [sedes, setSedes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    comuna: "", // 🚀 CORREGIDO: Cambiado de telefono a comuna
  });

  const backendUrl = "http://localhost:5000/api/sedes";

  // 1. Obtener todas las sedes desde el backend
  const fetchSedes = () => {
    setCargando(true);
    const token = authService.getToken();

    fetch(backendUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("🔴 RESPUESTA LECTURA SEDES:", data);
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

  // 2. Crear o Editar una Sede
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
          comuna: form.comuna, // 🚀 CORREGIDO: Enviando la columna exacta al backend
        }),
      });

      const data = await res.json();
      console.log("🟢 RESPUESTA GUARDADO SEDE:", data);

      if (data.success || res.ok) {
        alert(
          editandoId
            ? "Sede actualizada con éxito"
            : "Nueva sede registrada con éxito",
        );
        limpiarFormulario();
        fetchSedes();
      } else {
        alert(
          "El servidor rechazó la operación: " +
            (data.message || "Error desconocido"),
        );
      }
    } catch (err) {
      console.error("Error al guardar la sede:", err);
      alert("Error de comunicación con el servidor.");
    }
  };

  // 3. Eliminar una Sede
  const handleEliminar = async (id, nombreSede) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas eliminar permanentemente la sede de "${nombreSede}"?`,
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
        alert("Sede removida del sistema con éxito");
        fetchSedes();
      } else {
        const data = await res.json();
        alert(data.message || "No se pudo eliminar la sede.");
      }
    } catch (err) {
      console.error("Error al eliminar sede:", err);
      alert("Hubo un problema al intentar procesar la baja.");
    }
  };

  const activarEdicion = (sede) => {
    setEditandoId(sede.id);
    setForm({
      nombre: sede.nombre,
      direccion: sede.direccion,
      comuna: sede.comuna || "", // 🚀 CORREGIDO: Cargando comuna en edición
    });
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setForm({
      nombre: "",
      direccion: "",
      comuna: "", // 🚀 CORREGIDO: Limpiando comuna
    });
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
      {/* SECCIÓN FORMULARIO (IZQUIERDA) */}
      <Card
        title={editandoId ? "Editar Detalles de Sede" : "Registrar Nueva Sede"}
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

          {/* 🚀 MODIFICADO: Bloque completo adaptado para capturar la Comuna */}
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

      {/* SECCIÓN TABLA DE REGISTROS (DERECHA) */}
      <Card title="Sedes de la Escuela Activas" icon={MapPin}>
        {cargando ? (
          <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>
            Sincronizando sucursales con el backend...
          </p>
        ) : sedes.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999", padding: "20px" }}>
            No hay sedes operando registradas en el sistema.
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
                  {/* 🚀 MODIFICADO: Columna de tabla de Teléfono a Comuna */}
                  <th style={{ padding: "12px" }}>Comuna</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {sedes.map((decaySede) => (
                  <tr
                    key={decaySede.id}
                    style={{ borderBottom: "1px solid #edf2f7" }}
                  >
                    <td
                      style={{
                        padding: "12px",
                        fontFamily: "monospace",
                        color: "#ff6b35",
                      }}
                    >
                      {decaySede.id}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        fontWeight: "600",
                        color: "#2c3e8f",
                      }}
                    >
                      {decaySede.nombre}
                    </td>
                    <td style={{ padding: "12px", color: "#555" }}>
                      {decaySede.direccion}
                    </td>
                    {/* 🚀 MODIFICADO: Imprime el dato dinámico real de la comuna */}
                    <td
                      style={{
                        padding: "12px",
                        color: "#718096",
                        textTransform: "capitalize",
                      }}
                    >
                      {decaySede.comuna || "—"}
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
                          onClick={() => activarEdicion(decaySede)}
                          style={styles.actionBtn}
                          title="Editar Sede"
                        >
                          <Edit2 size={15} color="#4c5fd5" />
                        </button>
                        <button
                          onClick={() =>
                            handleEliminar(decaySede.id, decaySede.nombre)
                          }
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

export default SedesView;
