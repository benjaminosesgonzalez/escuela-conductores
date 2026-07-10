import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importante para la redirección
import { authService } from "../services/authService.js"; // Conexión a tu servicio de auth

const LandingPage = () => {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]); // Cambiamos de 'plans' estático a estado dinámico
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorConexion, setErrorConexion] = useState(null);

  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    setCargando(true);
    setErrorConexion(null);

    const usuarioActivo = authService.getCurrentUser();
    if (usuarioActivo) {
      setUsuario(usuarioActivo);
    }

    fetch("http://localhost:5000/api/plans")
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Servidor fuera de línea o ruta inválida (Status: ${res.status})`,
          );
        }
        return res.json();
      })
      .then((data) => {
        console.log("DATA INTERNA RECIBIDA EN LANDING:", data);

        // Desempaquetamos con máxima seguridad según el formato que venga
        if (data && Array.isArray(data.data)) {
          setPlanes(data.data);
        } else if (Array.isArray(data)) {
          setPlanes(data);
        } else {
          console.error("El formato recibido no es un arreglo válido:", data);
        }
      })
      .catch((err) => {
        console.error("❌ CAPTURA DE ERROR EN LANDING:", err);
        setErrorConexion(err.message); // Guardamos el error real para mostrarlo
      })
      .finally(() => {
        setCargando(false); // EL APAGADOR CRUCIAL: Pase lo que pase, se detiene la carga
      });
  }, []);

  // 🚀 NUEVO: Función para destruir la sesión de forma limpia
  const handleCerrarSesion = () => {
    authService.logout(); // Limpia los tokens y el user del localStorage
    setUsuario(null); // Reseteamos el estado para refrescar el Header al instante
    navigate("/"); // Forzamos la permanencia en la Landing
  };

  // 2. Lógica de Redirección Inteligente al seleccionar un Plan
  const handleElegirPlan = (idPlan) => {
    setSelectedPlan(idPlan);
    const usuarioLogueado = authService.getCurrentUser();

    if (!usuarioLogueado) {
      // CASO A: No está logueado. Guardamos su interés y lo mandamos al login o registro
      localStorage.setItem("plan_pendiente", idPlan);
      alert(
        "Para adquirir un plan de conducción, por favor inicia sesión o regístrate en nuestra plataforma.",
      );
      navigate("/login");
    } else {
      // CASO B: Ya está logueado. Lo enviamos directo a la pantalla de confirmación y pago simulado
      navigate(`/confirmar-plan?planId=${idPlan}`);
    }
  };

  // 🔥 MODIFICADO: Ahora recibe el objeto 'plan' completo para evaluar si está cerrado
  const getCardStyle = (plan) => {
    const estaCerrado = plan.inscripciones_abiertas === false;
    const esSeleccionado = selectedPlan === plan.id;
    const esHovered = hoveredPlan === plan.id;

    return {
      backgroundColor: estaCerrado
        ? "#4a526d"
        : esSeleccionado
          ? "#ff6b35"
          : "#3c47a1", // Gris azulado opaco si está cerrado
      opacity: estaCerrado ? 0.7 : 1,
      padding: "24px 20px",
      borderRadius: "16px",
      textAlign: "center",
      cursor: estaCerrado ? "not-allowed" : "pointer",
      pointerEvents: estaCerrado ? "none" : "auto", // 🔥 Bloquea clics accidentales en la tarjeta
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: estaCerrado
        ? "scale(1)"
        : esSeleccionado
          ? "scale(1.03)"
          : esHovered
            ? "translateY(-4px)"
            : "scale(1)",
      boxShadow: estaCerrado
        ? "none"
        : esSeleccionado
          ? "0 8px 24px rgba(255, 107, 53, 0.3)"
          : esHovered
            ? "0 4px 16px rgba(0,0,0,0.15)"
            : "none",
      border:
        !estaCerrado && esSeleccionado
          ? "2px solid rgba(255,255,255,0.3)"
          : "none",
    };
  };

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', 'Roboto', sans-serif",
        backgroundColor: "#e8ecf7",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .action-btn {
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .action-btn:active:not(:disabled) {
          transform: translateY(0);
        }
          
        .action-btn:disabled {
          cursor: not-allowed;
        }

        @media (max-width: 1024px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header con logo y botones */}
      <div
        style={{
          backgroundColor: "#8793d8",
          padding: "24px 60px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#4c5fd5",
            color: "white",
            padding: "14px 28px",
            borderRadius: "10px",
            fontWeight: "bold",
            fontSize: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          ESCUELA DE CONDUCTORES
        </div>

        {/* Renderizado condicional según el estado de autenticación */}
        {usuario ? (
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <span
              style={{ color: "white", fontSize: "15px", fontWeight: "600" }}
            >
              Hola,{" "}
              <strong style={{ textTransform: "capitalize" }}>
                {usuario.nombre}
              </strong>
            </span>

            <button
              onClick={handleCerrarSesion}
              className="action-btn"
              style={{
                backgroundColor: "transparent",
                color: "white",
                border: "2px solid white",
                padding: "12px 24px",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "16px" }}>
            <button
              onClick={() => navigate("/login")}
              className="action-btn"
              style={{
                backgroundColor: "#5a68d8",
                color: "white",
                border: "none",
                padding: "12px 28px",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Iniciar sesión
            </button>

            <button
              onClick={() => navigate("/registro")}
              className="action-btn"
              style={{
                backgroundColor: "#ff6b35",
                color: "white",
                border: "none",
                padding: "12px 28px",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Registrarse
            </button>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div
        style={{
          backgroundColor: "#d5dce8",
          padding: "30px 60px",
          flex: 1,
          width: "100%",
        }}
      >
        <div
          className="main-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
            width: "100%",
          }}
        >
          {/* Sección izquierda */}
          <div>
            <section style={{ marginBottom: "30px" }}>
              <h1
                style={{
                  color: "#2c3e8f",
                  fontSize: "50px",
                  fontWeight: "700",
                  margin: "0 0 10px 0",
                  lineHeight: "1.2",
                  letterSpacing: "-0.5px",
                }}
              >
                ¡Bienvenido a nuestra Escuela de Conductores!
              </h1>

              <h2
                style={{
                  color: "#2c3e8f",
                  fontSize: "22px",
                  fontWeight: "700",
                  margin: "0 0 14px 0",
                }}
              >
                ¿Por qué elegirnos?
              </h2>

              <p
                style={{
                  color: "#2c3e8f",
                  fontSize: "22px",
                  lineHeight: "1.4",
                  margin: "0",
                }}
              >
                Te preparamos para conducir de manera <strong>segura</strong> y
                responsable, ofreciendo cursos teóricos y prácticos adaptados a
                tus necesidades.
              </p>
            </section>

            <div
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                marginBottom: "30px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                backgroundColor: "white",
              }}
            >
              <img
                src="https://i.imgur.com/GXsbTIp.png"
                alt="Instructor enseñando"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>

            <section style={{ marginBottom: "0px" }}>
              <h3
                style={{
                  color: "#2c3e8f",
                  fontSize: "22px",
                  fontWeight: "700",
                  margin: "0 0 14px 0",
                }}
              >
                Quiénes somos
              </h3>

              <p
                style={{
                  color: "#2c3e8f",
                  fontSize: "22px",
                  lineHeight: "1.4",
                  margin: "0",
                  textAlign: "justify",
                }}
              >
                Somos una escuela de conductores con{" "}
                <strong>años de experiencia</strong> formando conductores
                responsables y seguros. Contamos con instructores certificados,
                vehículos modernos y flexibilidad de horarios para adaptarnos a
                tus necesidades. Aprende a conducir con nosotros y obtén tu
                licencia de conducir con confianza.
              </p>
            </section>
          </div>

          {/* Sección derecha - Planes Conectados al Backend */}
          <div>
            <div
              style={{
                backgroundColor: "#7d88d1",
                margin: "40px 0 0 0",
                padding: "60px 36px",
                borderRadius: "30px",
                color: "white",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              }}
            >
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "28px",
                  fontWeight: "750",
                  margin: "0px 0 30px 0",
                  padding: "4px 0px",
                  letterSpacing: "-0.3px",
                }}
              >
                Elige tu plan de conducción
              </h2>

              {cargando ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "white",
                    fontSize: "16px",
                    margin: "40px 0",
                  }}
                >
                  Sincronizando planes de la escuela...
                </p>
              ) : planes.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "white",
                    fontSize: "14px",
                    margin: "40px 0",
                  }}
                >
                  No hay planes cargados por la administración actualmente.
                </p>
              ) : (
                <>
                  {/* Grid de Tarjetas */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${Math.min(planes.length, 3)}, 1fr)`,
                      gap: "16px",
                      marginBottom: "24px",
                    }}
                  >
                    {planes.map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        onMouseEnter={() => setHoveredPlan(plan.id)}
                        onMouseLeave={() => setHoveredPlan(null)}
                        style={getCardStyle(plan)} // 🔥 Cambio: Pasamos el objeto plan completo
                      >
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            margin: "0 0 16px 0",
                            color: "white",
                            whiteSpace: "pre-line",
                            lineHeight: "1.3",
                            textTransform: "capitalize",
                          }}
                        >
                          {plan.nombre}
                        </h3>

                        <div style={{ fontSize: "32px", marginBottom: "18px" }}>
                          🚗
                        </div>

                        <div
                          style={{
                            backgroundColor:
                              selectedPlan === plan.id
                                ? "rgba(255,255,255,0.3)"
                                : "rgba(255,255,255,0.2)",
                            padding: "12px",
                            borderRadius: "8px",
                            marginBottom: "30px",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "22px",
                              fontWeight: "700",
                              margin: "0",
                              color: "white",
                            }}
                          >
                            {/* Formateador rápido para dinero chileno */}
                            {typeof plan.precio === "number"
                              ? `$${plan.precio.toLocaleString("es-CL")}`
                              : plan.precio}
                          </p>
                        </div>

                        {/* Mapeo de Atributos del Backend */}
                        <ul
                          style={{
                            textAlign: "left",
                            fontSize: "13px",
                            margin: "0",
                            padding: "0",
                            listStyle: "none",
                            lineHeight: "1.8",
                            color: "white",
                          }}
                        >
                          <li style={{ marginBottom: "10px" }}>
                            ✓ {plan.clases_practicas || 0} clases prácticas
                          </li>
                          <li style={{ marginBottom: "10px" }}>
                            ✓ Curso teórico {plan.nivel_teorico || "Básico"}
                          </li>
                          <li style={{ marginBottom: "10px" }}>
                            ✓ {plan.clases_simulador || 0} de simulador
                          </li>
                        </ul>

                        {/* 🔥 NUEVO: Mensaje visual si las inscripciones están cerradas */}
                        {plan.inscripciones_abiertas === false && (
                          <div
                            style={{
                              backgroundColor: "rgba(220, 38, 38, 0.25)",
                              color: "#ffcbd4",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              marginTop: "16px",
                              fontSize: "12px",
                              fontWeight: "700",
                              border: "1px solid rgba(220, 38, 38, 0.4)",
                            }}
                          >
                            🚫 Periodo de inscripciones cerrado
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Fila de Botones de Compra */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${Math.min(planes.length, 3)}, 1fr)`,
                      gap: "12px",
                    }}
                  >
                    {planes.map((plan) => (
                      <button
                        key={`btn-${plan.id}`}
                        onClick={() => handleElegirPlan(plan.id)}
                        disabled={plan.inscripciones_abiertas === false} // 🔥 NUEVO: Atributo nativo disabled
                        className="action-btn"
                        style={{
                          backgroundColor:
                            plan.inscripciones_abiertas === false
                              ? "#6b7280" // Botón gris si está cerrado
                              : selectedPlan === plan.id
                                ? "#ff6b35"
                                : "#4c5fd5",
                          color: "white",
                          border: "none",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          fontWeight: "700",
                          fontSize: "13px",
                          cursor:
                            plan.inscripciones_abiertas === false
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            plan.inscripciones_abiertas === false ? 0.8 : 1,
                        }}
                      >
                        {/* 🔥 NUEVO: Texto dinámico según disponibilidad */}
                        {plan.inscripciones_abiertas === false
                          ? "Inscripción cerrada"
                          : "Elegir plan"}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#d5dce8",
          padding: "12px 60px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "32px",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#2c3e8f",
                fontWeight: "700",
                fontSize: "15px",
              }}
            >
              <span>✓</span>
              <span>Clases prácticas y teóricas</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#2c3e8f",
                fontWeight: "700",
                fontSize: "15px",
              }}
            >
              <span>📅</span>
              <span>Horarios flexibles y certificados</span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <p
              style={{
                color: "#2c3e8f",
                fontWeight: "700",
                margin: "0 0 6px 0",
                fontSize: "15px",
              }}
            >
              ¿Tienes preguntas? Habla con nosotros por
            </p>

            <p
              style={{
                color: "#2c3e8f",
                fontWeight: "700",
                margin: "0",
                fontSize: "15px",
              }}
            >
              💬 Whatsapp +569 9888 8777
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
