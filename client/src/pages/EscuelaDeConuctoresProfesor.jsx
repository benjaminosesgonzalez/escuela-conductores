import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Calendar,
  Car,
  Menu,
  X,
  Video,
  Clock,
  MapPin,
  CheckSquare,
  Bell,
  LogOut,
  FolderOpen,
} from "lucide-react";

import { authService } from "../services/authService";

export default function DashboardProfesor() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("inicio");

  const [archivos, setArchivos] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [cargandoArchivo, setCargandoArchivo] = useState(false);

  const currentUser = authService.getCurrentUser();
  const profesorNombre = currentUser?.email || "Profesor";

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const cargarArchivos = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/repositorio");
      const data = await response.json();

      if (data.success) {
        setArchivos(data.archivos);
      }
    } catch (error) {
      console.error("Error al cargar archivos:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "repositorio") {
      cargarArchivos();
    }
  }, [activeTab]);

  const subirArchivo = async () => {
    if (!archivoSeleccionado) {
      alert("Selecciona un archivo antes de subir.");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivoSeleccionado);

    try {
      setCargandoArchivo(true);

      const response = await fetch(
        "http://localhost:5000/api/repositorio/subir",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (data.success) {
        alert("Archivo subido correctamente.");
        setArchivoSeleccionado(null);
        await cargarArchivos();

        const inputArchivo = document.getElementById("archivoRepositorio");
        if (inputArchivo) {
          inputArchivo.value = "";
        }
      } else {
        alert(data.message || "No se pudo subir el archivo.");
      }
    } catch (error) {
      console.error("Error al subir archivo:", error);
      alert("Error al subir archivo.");
    } finally {
      setCargandoArchivo(false);
    }
  };

  const eliminarArchivo = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este archivo?",
    );

    if (!confirmar) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/repositorio/${id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (data.success) {
        alert("Archivo eliminado correctamente.");
        await cargarArchivos();
      } else {
        alert(data.message || "No se pudo eliminar el archivo.");
      }
    } catch (error) {
      console.error("Error al eliminar archivo:", error);
      alert("Error al eliminar archivo.");
    }
  };

  const stats = [
    { icon: Users, label: "Alumnos a cargo", value: "9", color: "#5a68d8" },
    {
      icon: Calendar,
      label: "Clases programadas hoy",
      value: "4",
      color: "#6366f1",
    },
    { icon: Car, label: "Vehículos asignados", value: "2", color: "#06b6d4" },
  ];

  const clases = [
    {
      id: 1,
      hora: "9:00 am - 9:30 am",
      alumno: "Carlos Silva",
      tipo: "Teórica",
      codigo: "S03",
      ubicacion: "Vía Zoom",
      tipo_label: "teórica",
    },
    {
      id: 2,
      hora: "12:00 pm - 12:30 pm",
      alumno: "Andres Ruiz",
      tipo: "Teórica",
      codigo: "S04",
      ubicacion: "Vía Zoom",
      tipo_label: "teórica",
    },
    {
      id: 3,
      hora: "13:30 pm - 14:30 pm",
      alumno: "Pablo López",
      tipo: "Práctica",
      codigo: "1",
      ubicacion: "San Pedro",
      tipo_label: "práctica",
    },
  ];

  const tareasRapidas = [
    { id: 1, titulo: "Evaluaciones pendientes", icon: CheckSquare, count: 3 },
    { id: 2, titulo: "Programar clase", icon: Calendar },
    { id: 3, titulo: "Reservar vehículo", icon: Car },
  ];

  const menuItems = [
    { id: "inicio", label: "Inicio", icon: Home },
    { id: "alumnos", label: "Alumnos", icon: Users },
    { id: "clases", label: "Mis clases", icon: Calendar },
    { id: "evaluacion", label: "Evaluación práctica", icon: Car },
    { id: "repositorio", label: "Repositorio", icon: FolderOpen },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          width: sidebarOpen ? "280px" : "80px",
          backgroundColor: "#7d88d1",
          color: "white",
          transition: "width 0.3s ease",
          overflowY: "auto",
          zIndex: 50,
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header Sidebar */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "white",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Car size={24} color="#7d88d1" />
          </div>

          {sidebarOpen && (
            <span
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                letterSpacing: "0.5px",
              }}
            >
              PROFESOR
            </span>
          )}
        </div>

        {/* Menu Items */}
        <nav
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginTop: "16px",
          }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor:
                    activeTab === item.id ? "white" : "transparent",
                  color:
                    activeTab === item.id ? "#7d88d1" : "rgba(255,255,255,0.8)",
                  fontWeight: activeTab === item.id ? "600" : "500",
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                }}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            marginTop: "auto",
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              backgroundColor: "transparent",
              color: "rgba(255,255,255,0.8)",
              fontSize: "14px",
              transition: "all 0.2s ease",
              width: "100%",
              fontWeight: "500",
            }}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Salir</span>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          marginLeft: sidebarOpen ? "280px" : "80px",
          flex: 1,
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* TOP NAVBAR */}
        <header
          style={{
            backgroundColor: "white",
            borderBottom: "1px solid #e0e0e0",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: "8px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#7d88d1",
                margin: 0,
              }}
            >
              ESCUELA DE CONDUCTORES
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <button
              style={{
                padding: "8px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <Bell size={24} color="#666" />

              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#ef4444",
                  borderRadius: "50%",
                }}
              ></span>
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                paddingLeft: "24px",
                borderLeft: "1px solid #e0e0e0",
              }}
            >
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#333",
                    margin: 0,
                  }}
                >
                  {profesorNombre.split("@")[0]}
                </p>

                <p
                  style={{
                    fontSize: "12px",
                    color: "#999",
                    margin: 0,
                  }}
                >
                  Profesor
                </p>
              </div>

              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#7d88d1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                {profesorNombre.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <div style={{ padding: "32px" }}>
          {/* INICIO */}
          {activeTab === "inicio" && (
            <>
              {/* Bienvenida */}
              <div style={{ marginBottom: "32px", textAlign: "center" }}>
                <h2
                  style={{
                    fontSize: "36px",
                    fontWeight: "bold",
                    color: "#333",
                    margin: "0 0 8px 0",
                  }}
                >
                  Bienvenido,{" "}
                  <span style={{ color: "#7d88d1" }}>
                    {profesorNombre.split("@")[0]}
                  </span>
                </h2>

                <p style={{ color: "#999", margin: 0, fontSize: "14px" }}>
                  15 de abril de 2024
                </p>
              </div>

              {/* STATS CARDS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "24px",
                  marginBottom: "32px",
                }}
              >
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={idx}
                      style={{
                        background: `linear-gradient(135deg, ${stat.color}80 0%, ${stat.color} 100%)`,
                        borderRadius: "12px",
                        padding: "24px",
                        color: "white",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "12px",
                        }}
                      >
                        <Icon size={32} opacity={0.8} />
                        <span style={{ fontSize: "32px", fontWeight: "bold" }}>
                          {stat.value}
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* CLASES Y TAREAS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "24px",
                }}
              >
                {/* CLASES DEL DÍA */}
                <div>
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "16px 24px",
                        borderBottom: "1px solid #e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Clock size={20} color="#7d88d1" />

                      <h3
                        style={{
                          margin: 0,
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "#333",
                        }}
                      >
                        Clases del día
                      </h3>
                    </div>

                    <div>
                      {clases.map((clase) => (
                        <div
                          key={clase.id}
                          style={{
                            padding: "20px 24px",
                            borderBottom: "1px solid #f0f0f0",
                            borderLeft: "4px solid #7d88d1",
                            transition: "background-color 0.2s ease",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "2fr 1fr",
                              gap: "16px",
                              alignItems: "start",
                              marginBottom: "12px",
                            }}
                          >
                            <div>
                              <p
                                style={{
                                  fontWeight: "600",
                                  fontSize: "16px",
                                  color: "#333",
                                  margin: "0 0 4px 0",
                                }}
                              >
                                {clase.hora}
                              </p>

                              <p
                                style={{
                                  fontSize: "13px",
                                  color: "#999",
                                  margin: 0,
                                }}
                              >
                                Alumno:{" "}
                                <span
                                  style={{ color: "#333", fontWeight: "500" }}
                                >
                                  {clase.alumno}
                                </span>
                              </p>
                            </div>

                            <div style={{ textAlign: "right" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "6px 12px",
                                  borderRadius: "20px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  backgroundColor:
                                    clase.tipo_label === "teórica"
                                      ? "#dbeafe"
                                      : "#dcfce7",
                                  color:
                                    clase.tipo_label === "teórica"
                                      ? "#1e40af"
                                      : "#166534",
                                }}
                              >
                                {clase.tipo} {clase.codigo}
                              </span>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              color: "#666",
                              fontSize: "13px",
                              marginBottom: "12px",
                            }}
                          >
                            <MapPin size={16} />
                            <span>{clase.ubicacion}</span>
                          </div>

                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              style={{
                                padding: "8px 16px",
                                backgroundColor: "#7d88d1",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <Video size={16} />
                              Unirse
                            </button>

                            <button
                              style={{
                                padding: "8px 16px",
                                backgroundColor: "#f0f0f0",
                                color: "#333",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "600",
                              }}
                            >
                              Información
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* TAREAS RÁPIDAS */}
                <div>
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "16px 24px",
                        borderBottom: "1px solid #e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <CheckSquare size={20} color="#7d88d1" />

                      <h3
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#333",
                        }}
                      >
                        Tareas rápidas
                      </h3>
                    </div>

                    <div>
                      {tareasRapidas.map((tarea) => {
                        const Icon = tarea.icon;

                        return (
                          <div
                            key={tarea.id}
                            style={{
                              padding: "20px 24px",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "12px",
                                marginBottom: "12px",
                              }}
                            >
                              <div
                                style={{
                                  padding: "8px",
                                  backgroundColor: "#f0f0f0",
                                  borderRadius: "6px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Icon size={18} color="#7d88d1" />
                              </div>

                              <div style={{ flex: 1 }}>
                                <p
                                  style={{
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    color: "#333",
                                    margin: 0,
                                  }}
                                >
                                  {tarea.titulo}
                                </p>

                                {tarea.count !== undefined && (
                                  <p
                                    style={{
                                      fontSize: "20px",
                                      fontWeight: "bold",
                                      color: "#7d88d1",
                                      margin: "4px 0 0 0",
                                    }}
                                  >
                                    {tarea.count}
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              style={{
                                width: "100%",
                                padding: "8px",
                                backgroundColor: "#7d88d1",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "600",
                              }}
                            >
                              {tarea.id === 1
                                ? "Ver"
                                : tarea.id === 2
                                  ? "Agendar"
                                  : "Reservar"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* REPOSITORIO */}
          {activeTab === "repositorio" && (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "32px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "24px",
                }}
              >
                <FolderOpen size={32} color="#7d88d1" />

                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#333",
                    }}
                  >
                    Repositorio de archivos
                  </h2>

                  <p
                    style={{
                      margin: "6px 0 0 0",
                      color: "#777",
                      fontSize: "14px",
                    }}
                  >
                    Sube material de apoyo para los alumnos, como documentos PDF
                    o videos MP4.
                  </p>
                </div>
              </div>

              <div
                style={{
                  border: "2px dashed #c7cbea",
                  borderRadius: "12px",
                  padding: "40px",
                  textAlign: "center",
                  backgroundColor: "#f8f9ff",
                  marginBottom: "24px",
                }}
              >
                <FolderOpen size={54} color="#7d88d1" />

                <h3
                  style={{
                    fontSize: "20px",
                    color: "#333",
                    margin: "16px 0 8px 0",
                  }}
                >
                  Cargar archivo
                </h3>

                <p
                  style={{
                    color: "#777",
                    fontSize: "14px",
                    marginBottom: "24px",
                  }}
                >
                  Selecciona un archivo PDF o MP4 desde tu computador.
                </p>

                <input
                  type="file"
                  accept=".pdf,.mp4,application/pdf,video/mp4"
                  id="archivoRepositorio"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const archivo = e.target.files[0];

                    if (archivo) {
                      setArchivoSeleccionado(archivo);
                    }
                  }}
                />

                <label
                  htmlFor="archivoRepositorio"
                  style={{
                    display: "inline-block",
                    padding: "12px 24px",
                    backgroundColor: "#7d88d1",
                    color: "white",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    marginRight: "12px",
                  }}
                >
                  Seleccionar PDF o MP4
                </label>

                <button
                  onClick={subirArchivo}
                  disabled={cargandoArchivo || !archivoSeleccionado}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: archivoSeleccionado ? "#22c55e" : "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: archivoSeleccionado ? "pointer" : "not-allowed",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {cargandoArchivo ? "Subiendo..." : "Subir archivo"}
                </button>

                {archivoSeleccionado && (
                  <p
                    style={{
                      marginTop: "16px",
                      color: "#333",
                      fontSize: "14px",
                    }}
                  >
                    Archivo seleccionado:{" "}
                    <strong>{archivoSeleccionado.name}</strong>
                  </p>
                )}
              </div>

              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  borderRadius: "10px",
                  padding: "20px",
                  border: "1px solid #e5e7eb",
                  marginTop: "24px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: "18px",
                    color: "#333",
                  }}
                >
                  Archivos cargados
                </h3>

                {archivos.length === 0 ? (
                  <p
                    style={{
                      margin: 0,
                      color: "#777",
                      fontSize: "14px",
                    }}
                  >
                    Aún no hay archivos cargados en el repositorio.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {archivos.map((archivo) => (
                      <div
                        key={archivo.id}
                        style={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "14px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              margin: "0 0 4px 0",
                              fontWeight: "600",
                              color: "#333",
                            }}
                          >
                            {archivo.nombreOriginal}
                          </p>

                          <p
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              color: "#777",
                            }}
                          >
                            {archivo.tipoArchivo} ·{" "}
                            {new Date(archivo.fechaSubida).toLocaleString()}
                          </p>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                          <a
                            href={`http://localhost:5000${archivo.rutaArchivo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "#7d88d1",
                              color: "white",
                              textDecoration: "none",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "600",
                            }}
                          >
                            Ver
                          </a>

                          <button
                            onClick={() => eliminarArchivo(archivo.id)}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
