import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";

const Registro = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const backendUrl = "http://localhost:5000/api";

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!nombre.trim() || !email.trim() || !password) {
      setError("Por favor completa todos los campos requeridos");
      setLoading(false);
      return;
    }

    try {
      // 1. Petición a tu ruta de auto-registro del backend
      const res = await fetch(`${backendUrl}/alumnos/registro/auto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password }),
      });

      const data = await res.json();

      if (data.success) {
        console.log("✅ Registro exitoso de alumno");

        // 2. Auto-loguear al usuario tras registrarse para obtener su sesión
        // Si tu endpoint 'registro/auto' ya retorna el token y el user, puedes usarlos directo.
        // Si no, llamamos al authService para iniciar sesión de inmediato:
        const loginResult = await authService.login(email, password);

        if (loginResult.success) {
          const planPendiente = localStorage.getItem("plan_pendiente");

          if (planPendiente) {
            console.log(
              `Alumno nuevo detectado con intención de compra para el plan: ${planPendiente}`,
            );

            // 3. Registrar el plan de interés en el backend antes de ir a pagar
            await fetch(`${backendUrl}/alumnos/preferencia`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ idPlan: planPendiente }),
            }).catch((err) =>
              console.error("Error al registrar preferencia inicial:", err),
            );

            // Desviar al nuevo alumno directo al checkout del plan que eligió en la Landing
            navigate(`/confirmar-plan?planId=${planPendiente}`);
          } else {
            // Si se registró de la nada sin elegir plan, lo mandamos a la landing para que escoja uno
            alert(
              "¡Registro completado! Por favor, selecciona el plan de conducción que deseas tomar.",
            );
            navigate("/");
          }
        } else {
          // Si falla el auto-login, lo mandamos a loguearse manualmente
          navigate("/login");
        }
      } else {
        setError(
          data.message ||
            "No se pudo completar el registro. Intenta con otro correo.",
        );
      }
    } catch (err) {
      console.error("❌ Error en registro:", err);
      setError("Error al conectar con el servidor de registros");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <button style={styles.logo} disabled>
            ESCUELA DE CONDUCTORES
          </button>
        </Link>
      </header>

      <main style={styles.main}>
        <section style={styles.card}>
          <h1 style={styles.title}>Crea tu cuenta</h1>
          <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>
            Regístrate para agendar tus clases y simular tu matrícula
          </p>

          <div style={styles.icon}>📝</div>

          {error && (
            <div style={styles.errorBox}>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          <form style={styles.form} onSubmit={handleRegistro}>
            <div style={styles.field}>
              <label style={styles.label}>Nombre Completo</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Ej: Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Correo Electrónico</label>
              <input
                style={styles.input}
                type="email"
                placeholder="ingresa@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Contraseña</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Crea una contraseña segura"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.registerButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
            >
              {loading ? "Creando expediente..." : "Registrarse y Continuar"}
            </button>

            <div style={{ marginTop: "14px" }}>
              <span style={{ fontSize: "13px", color: "#666" }}>
                ¿Ya tienes una cuenta?{" "}
              </span>
              <Link
                to="/login"
                style={{
                  fontSize: "13px",
                  color: "#5a68d8",
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                Inicia sesión aquí
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

// ================================================================
// Estilos Clonados de tu Login.jsx para consistencia estética absoluta
// ================================================================
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#d5dce8",
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
    color: "#243b91",
  },
  header: {
    height: "82px",
    backgroundColor: "#8793d8",
    display: "flex",
    alignItems: "center",
    padding: "0 60px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  },
  logo: {
    backgroundColor: "#4c5fd5",
    color: "white",
    border: "none",
    padding: "14px 28px",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "default",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  main: {
    minHeight: "calc(100vh - 82px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
  },
  card: {
    width: "410px",
    backgroundColor: "white",
    borderRadius: "18px",
    padding: "36px 34px",
    boxShadow: "0 14px 35px rgba(0,0,0,0.15)",
    textAlign: "center",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#2c3e8f",
    marginBottom: "6px",
  },
  icon: { fontSize: "44px", marginBottom: "20px" },
  errorBox: {
    backgroundColor: "#fee",
    border: "1px solid #fcc",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "18px",
  },
  errorText: { color: "#c33", fontSize: "14px", margin: "0" },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  field: { textAlign: "left" },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "700",
    color: "#2c3e8f",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    border: "none",
    borderBottom: "2px solid #8793d8",
    padding: "10px 4px",
    fontSize: "15px",
    outline: "none",
    color: "#2c3e8f",
    backgroundColor: "transparent",
    boxSizing: "border-box",
  },
  registerButton: {
    marginTop: "12px",
    backgroundColor: "#ff6b35",
    color: "white",
    border: "none",
    borderRadius: "999px",
    padding: "13px",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 5px 12px rgba(255,107,53,0.3)",
    transition: "all 0.3s ease",
  },
};

export default Registro;
