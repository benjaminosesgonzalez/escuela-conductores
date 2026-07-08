import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CreditCard, ShieldCheck, ArrowLeft, CheckCircle } from "lucide-react";
// 🔥 NUEVO: Importamos el servicio de autenticación para saber quién está operando
import { authService } from "../../services/authService";

const ConfirmarPlan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const planId = searchParams.get("planId");
  const userToken = localStorage.getItem("token");
  const backendUrl = "http://localhost:5000/api";

  const [planInfo, setPlanInfo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!planId) {
      setError("No se ha especificado ningún plan para la matrícula.");
      setCargando(false);
      return;
    }

    fetch(`${backendUrl}/plans`)
      .then((res) => res.json())
      .then((data) => {
        const listaPlanes = data.data || data;
        const planEncontrado = listaPlanes.find(
          (p) => String(p.id) === String(planId),
        );

        if (planEncontrado) {
          setPlanInfo(planEncontrado);
        } else {
          setError(
            "El plan seleccionado no es válido o ya no está disponible.",
          );
        }
      })
      .catch((err) => {
        console.error("Error al cargar detalles del plan:", err);
        setError("Error de comunicación con el servidor.");
      })
      .finally(() => setCargando(false));
  }, [planId]);

  const handleSimularPago = async () => {
    setProcesandoPago(true);
    setError("");

    // Capturamos los datos del alumno logueado en este milisegundo
    const alumnoLogueado = authService.getCurrentUser();

    setTimeout(async () => {
      try {
        // 🔥 CORREGIDO: Apuntando a tu ruta real '/alumnos/matricular'
        const res = await fetch(`${backendUrl}/alumnos/matricular`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          // 🔥 ENVIAMOS EL SET COMPLETO DE LLAVES QUE EL CONTROLADOR NECESITA
          body: JSON.stringify({
            id_alumno: alumnoLogueado?.id || alumnoLogueado?.sub, // ID extraído de la sesión del navegador
            id_plan_definitivo: Number(planInfo.id), // Forzamos número entero
            idPlan: Number(planInfo.id), // Enviamos ambas variantes por seguridad
          }),
        });

        const data = await res.json();

        if (data.success || res.ok) {
          setPagoExitoso(true);
          localStorage.removeItem("plan_pendiente");

          setTimeout(() => {
            navigate("/alumno");
          }, 3000);
        } else {
          setError(
            data.message || "La simulación de pago fue rechazada por el banco.",
          );
          setProcesandoPago(false);
        }
      } catch (err) {
        console.error("Error al procesar matrícula:", err);
        setError(
          "El pago fue aprobado, pero no pudimos conectar con tu matrícula del backend.",
        );
        setProcesandoPago(false);
      }
    }, 2000);
  };

  if (cargando) {
    return (
      <div style={styles.centerContainer}>
        <p style={styles.loadingText}>
          Cargando detalles de tu orden de compra...
        </p>
      </div>
    );
  }

  if (pagoExitoso) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.successCard}>
          <CheckCircle
            size={64}
            color="#22c55e"
            style={{ marginBottom: "16px" }}
          />
          <h1 style={styles.successTitle}>¡Pago Procesado con Éxito!</h1>
          <p style={styles.successText}>
            Tu matrícula en el <strong>{planInfo?.nombre}</strong> ha quedado
            registrada correctamente en la base de datos.
          </p>
          <span style={styles.successBadge}>
            Redirigiéndote a tu Escuela...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Navbar Minimalista */}
      <header style={styles.header}>
        <Link to="/" style={styles.backLink}>
          <ArrowLeft size={18} /> Volver a la Escuela
        </Link>
        <span style={styles.headerTitle}>CAJA DE PAGO SEGURO</span>
      </header>

      <main style={styles.main}>
        <div style={styles.checkoutGrid}>
          {/* COLUMNA IZQUIERDA: DETALLES DEL CURSO */}
          <div style={styles.summaryCard}>
            <h2 style={styles.sectionTitle}>Resumen de Inscripción</h2>
            <hr style={styles.divider} />

            {error ? (
              <div style={styles.errorBox}>{error}</div>
            ) : (
              planInfo && (
                <>
                  <h3 style={styles.planName}>{planInfo.nombre}</h3>
                  <div style={styles.specRow}>
                    <span>🚗 Clases Prácticas de Conducción:</span>
                    <strong>{planInfo.clases_practicas} sesiones</strong>
                  </div>
                  <div style={styles.specRow}>
                    <span>📖 Nivel de Preparación Teórica:</span>
                    <strong>{planInfo.nivel_teorico}</strong>
                  </div>
                  <div style={styles.specRow}>
                    <span>🖥️ Sesiones de Simulador Virtual:</span>
                    <strong>{planInfo.clases_simulador} bloques</strong>
                  </div>

                  <div style={styles.totalBox}>
                    <span style={styles.totalLabel}>TOTAL A PAGAR:</span>
                    <span style={styles.totalPrice}>
                      ${planInfo.precio?.toLocaleString("es-CL")}
                    </span>
                  </div>
                </>
              )
            )}
          </div>

          {/* COLUMNA DERECHA: PASARELA SIMULADA */}
          <div style={styles.paymentCard}>
            <div style={styles.paymentHeader}>
              <CreditCard size={22} color="#2c3e8f" />
              <h2 style={{ ...styles.sectionTitle, margin: 0 }}>
                Simulación Webpay / Transbank
              </h2>
            </div>
            <p style={styles.paymentInstructions}>
              Este es un módulo de simulación académica. No se requerirán tus
              datos bancarios reales ni se realizarán cobros a tus tarjetas.
            </p>

            <div style={styles.cardGraphic}>
              <div style={styles.cardChip}></div>
              <div style={styles.cardNumber}>•••• •••• •••• 4321</div>
              <div style={styles.cardFooter}>
                <span>ALUMNO ESCUELA</span>
                <span>12 / 29</span>
              </div>
            </div>

            <button
              onClick={handleSimularPago}
              disabled={procesandoPago || !planInfo}
              style={{
                ...styles.payButton,
                backgroundColor: procesandoPago ? "#ccc" : "#ff6b35",
                cursor: procesandoPago ? "not-allowed" : "pointer",
              }}
            >
              {procesandoPago
                ? "Validando con el banco transaccional..."
                : "Confirmar Transacción Simbólica"}
            </button>

            <div style={styles.secureFooter}>
              <ShieldCheck size={16} color="#166534" />
              <span>
                Conexión académica protegida por token de sesión institucional
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ================================================================
// Diseño de Estilos Inline en sintonía con tu Landing y Login
// ================================================================
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#e8ecf7",
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
  },
  centerContainer: {
    minHeight: "100vh",
    backgroundColor: "#d5dce8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  loadingText: { fontSize: "16px", color: "#243b91", fontWeight: "600" },
  header: {
    height: "70px",
    backgroundColor: "#8793d8",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  backLink: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "white",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
  },
  headerTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: "14px",
    letterSpacing: "1px",
  },
  main: { padding: "40px 60px", display: "flex", justifyContent: "center" },
  checkoutGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "32px",
    width: "100%",
    maxWidth: "1000px",
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
  paymentCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "750",
    color: "#2c3e8f",
    margin: "0 0 16px 0",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #e2e8f0",
    marginBottom: "20px",
  },
  planName: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#ff6b35",
    textTransform: "capitalize",
    marginBottom: "20px",
  },
  specRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "#4a5568",
    marginBottom: "14px",
    paddingBottom: "10px",
    borderBottom: "1px dashed #edf2f7",
  },
  totalBox: {
    marginTop: "30px",
    backgroundColor: "#f8fafc",
    padding: "20px",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #e2e8f0",
  },
  totalLabel: { fontWeight: "bold", color: "#2c3e8f", fontSize: "14px" },
  totalPrice: { fontSize: "28px", fontWeight: "800", color: "#2c3e8f" },
  paymentHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },
  paymentInstructions: {
    fontSize: "13px",
    color: "#718096",
    lineHeight: "1.5",
    marginBottom: "24px",
  },
  cardGraphic: {
    height: "160px",
    background: "linear-gradient(135deg, #3c47a1 0%, #243b91 100%)",
    borderRadius: "12px",
    padding: "24px",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: "24px",
    boxShadow: "0 6px 15px rgba(36,59,145,0.25)",
  },
  cardChip: {
    width: "36px",
    height: "26px",
    backgroundColor: "#ecc94b",
    borderRadius: "4px",
  },
  cardNumber: {
    fontSize: "18px",
    letterSpacing: "2px",
    fontFamily: "monospace",
    margin: "14px 0",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    letterSpacing: "0.5px",
  },
  payButton: {
    width: "100%",
    padding: "14px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "700",
    boxShadow: "0 4px 12px rgba(255,107,53,0.25)",
    transition: "transform 0.2s",
  },
  secureFooter: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    justifyContent: "center",
    fontSize: "12px",
    color: "#166534",
    marginTop: "auto",
    paddingTop: "20px",
  },
  errorBox: {
    backgroundColor: "#fff5f5",
    border: "1px solid #fed7d7",
    color: "#c53030",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
  },
  successCard: {
    backgroundColor: "white",
    padding: "40px 32px",
    borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
    maxWidth: "450px",
  },
  successTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#1a202c",
    marginBottom: "10px",
  },
  successText: {
    fontSize: "14px",
    color: "#4a5568",
    lineHeight: "1.6",
    marginBottom: "24px",
  },
  successBadge: {
    fontSize: "12px",
    color: "#2b6cb0",
    backgroundColor: "#ebf8ff",
    padding: "6px 16px",
    borderRadius: "20px",
    fontWeight: "600",
  },
};

export default ConfirmarPlan;
