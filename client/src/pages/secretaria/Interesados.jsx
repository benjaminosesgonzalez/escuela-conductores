import { useEffect, useState } from "react";
// Importamos los íconos necesarios
import { Users, Mail, Percent, BarChart3, Phone } from "lucide-react";
import { Card, Button } from "../../components/shared/index.js";
import { colors } from "../../theme/index.js";

const Interesados = () => {
  const [prospectos, setProspectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  // Estado para controlar el porcentaje seleccionado por cada alumno individualmente
  const [descuentos, setDescuentos] = useState({});

  const backendUrl = "http://localhost:5000/api";
  const userToken = localStorage.getItem("token");

  // 1. Obtener los alumnos desde el backend
  useEffect(() => {
    fetch(`${backendUrl}/alumnos`, {
      headers: { Authorization: `Bearer ${userToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const listaAlumnos = data.data || data;
        if (Array.isArray(listaAlumnos)) {
          // Filtramos alumnos con plan de interés que no se han matriculado
          const filtrados = listaAlumnos.filter(
            (alumno) =>
              alumno.id_plan_interes &&
              alumno.estado_matricula !== "matriculado",
          );
          setProspectos(filtrados);
        }
      })
      .catch((err) => console.error("Error cargando prospectos:", err))
      .finally(() => setCargando(false));
  }, [userToken]);

  // Manejador para cambiar el porcentaje de una fila específica
  const handlePorcentajeChange = (id, valor) => {
    setDescuentos((prev) => ({ ...prev, [id]: valor }));
  };

  // 2. Simulación de Envío de Oferta Especial
  const handleEnviarOferta = (email, planNombre, porcentaje) => {
    setMensaje(
      `¡Oferta enviada con éxito a ${email}! Se despachó un cupón del ${porcentaje}% para el curso ${planNombre}.`,
    );
    setTimeout(() => setMensaje(""), 4000);
  };

  const totalInteresados = prospectos.length;

  if (cargando) {
    return (
      <p
        style={{
          color: colors.textSecondary,
          textAlign: "center",
          padding: "20px",
        }}
      >
        Cargando métricas de interés...
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Alertas de Acción */}
      {mensaje && (
        <div
          style={{
            padding: "14px 20px",
            backgroundColor: "#eff6ff",
            color: "#1e40af",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            border: "1px solid #bfdbfe",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Percent size={18} />
          <span>{mensaje}</span>
        </div>
      )}

      {/* TARJETA DE MÉTRICAS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "24px",
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          border: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            textAlign: "center",
            borderRight: "2px solid #edf2f7",
            paddingRight: "20px",
          }}
        >
          <BarChart3
            size={36}
            color="#ff6b35"
            style={{ margin: "0 auto 8px auto" }}
          />
          <h3
            style={{
              fontSize: "32px",
              fontWeight: "800",
              margin: 0,
              color: "#2c3e8f",
            }}
          >
            {totalInteresados}
          </h3>
          <p
            style={{
              fontSize: "13px",
              color: "#666",
              margin: "4px 0 0 0",
              fontWeight: "600",
            }}
          >
            PAGOS ABANDONADOS
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <p
            style={{
              fontSize: "14px",
              color: "#4a5568",
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            <strong>Usuarios que abandonaron:</strong> Estos usuarios se
            registraron en el sistema y seleccionaron un plan, pero se retiraron
            en la pasarela de pago. Envíales un recordatorio o comunícate
            directamente para ofrecerles asistencia.
          </p>
        </div>
      </div>

      {/* BANDEJA PRINCIPAL DE INTERESADOS */}
      <Card title="Bandeja de Recuperación: Alumnos Interesados" icon={Users}>
        {prospectos.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#999",
              fontSize: "14px",
            }}
          >
            No hay registros abandonados. Todos los alumnos interesados han
            completado sus matrículas oficiales.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "14px",
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
                  <th style={{ padding: "12px 8px" }}>Alumno</th>
                  <th style={{ padding: "12px 8px" }}>Contacto</th>
                  <th style={{ padding: "12px 8px" }}>Plan de Interés</th>
                  <th style={{ padding: "12px 8px", textAlign: "right" }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {prospectos.map((alumno) => {
                  // 🚀 EXTRACCIÓN REAL DE RELACIÓN 1:1 DESDE USER:
                  // Buscamos dinámicamente tanto 'email' como 'correo' dentro del objeto anidado 'user'
                  const alumnoEmail =
                    alumno.user?.email ||
                    alumno.user?.correo ||
                    alumno.email ||
                    "Sin correo registrado";

                  return (
                    <tr
                      key={alumno.id}
                      style={{
                        borderBottom: "1px solid #edf2f7",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <td
                        style={{
                          padding: "16px 8px",
                          fontWeight: "600",
                          color: "#333",
                          textTransform: "capitalize",
                        }}
                      >
                        {alumno.nombre} {alumno.apellido || ""}
                      </td>

                      {/* Renderizado de Datos de Contacto */}
                      <td style={{ padding: "16px 8px", color: "#555" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <Mail size={14} color="#7d88d1" />
                            <span style={{ fontSize: "13px" }}>
                              {alumnoEmail}
                            </span>
                          </div>
                          {alumno.telefono && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "#718096",
                                fontSize: "13px",
                              }}
                            >
                              <Phone size={14} color="#22c55e" />
                              <span>{alumno.telefono}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: "16px 8px" }}>
                        <span
                          style={{
                            backgroundColor: "#fef3c7",
                            color: "#d97706",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                          }}
                        >
                          {alumno.id_plan_interes}
                        </span>
                      </td>

                      {/* Selector de Porcentaje + Botón de Envío */}
                      <td style={{ padding: "16px 8px", textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "10px",
                          }}
                        >
                          <select
                            value={descuentos[alumno.id] || "10"}
                            onChange={(e) =>
                              handlePorcentajeChange(alumno.id, e.target.value)
                            }
                            style={{
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e0",
                              fontSize: "13px",
                              backgroundColor: "white",
                              cursor: "pointer",
                              outline: "none",
                              color: "#4a5568",
                              fontWeight: "600",
                            }}
                          >
                            <option value="10">10% Desc</option>
                            <option value="15">15% Desc</option>
                            <option value="20">20% Desc</option>
                            <option value="25">25% Desc</option>
                          </select>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              handleEnviarOferta(
                                alumnoEmail,
                                alumno.id_plan_interes,
                                descuentos[alumno.id] || "10",
                              )
                            }
                            style={{
                              backgroundColor: "#4c5fd5",
                              fontSize: "12px",
                            }}
                          >
                            Enviar Descuento
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Interesados;
