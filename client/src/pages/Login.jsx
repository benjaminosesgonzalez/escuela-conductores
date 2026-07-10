import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const backendUrl = "http://localhost:5000/api";

    if (!email.trim()) {
      setError("Por favor ingresa tu correo");
      loading(false);
      return;
    }

    if (!password) {
      setError("Por favor ingresa tu contraseña");
      setLoading(false);
      return;
    }

    try {
      const result = await authService.login(email, password);

      if (result.success) {
        console.log("✅ Login exitoso:", result.user);

        const rol = result.user.rol;
        console.log(`Rol detectado: ${rol}`);

        // Mapear roles a rutas base
        const rutasPorRol = {
          profesor: "/profesor",
          secretaria: "/secretaria",
          administracion: "/administracion", // Administradores ven secretaria
        };

        // ================================================================
        // 🛡️ INTERCEPCIÓN DE FLUJO PARA EL ALUMNO (MURO DE PAGO)
        // ================================================================
        if (rol === "alumno") {
          const planPendiente = localStorage.getItem("plan_pendiente");

          if (planPendiente) {
            console.log(`Desviando alumno al pago del plan: ${planPendiente}`);

            // 🔥 NUEVO: Avisamos al backend el plan de interés por si el alumno no termina el pago
            fetch(`${backendUrl}/alumnos/seleccionar-interes`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                // El authService.login ya guardó el token en el localStorage, lo extraemos de ahí
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ idPlan: planPendiente }),
            }).catch((err) =>
              console.error(
                "Error al registrar plan de interés en segundo plano:",
                err,
              ),
            );

            // Sigue su camino normal hacia la caja de confirmación y pago simulado
            navigate(`/confirmar-plan?planId=${planPendiente}`);
          } else if (result.user.estado_matricula !== "matriculado") {
            // Caso 2: No tiene plan guardado y NO está matriculado -> Va a la landing a elegir uno
            alert(
              "Detectamos que aún no tienes un plan contratado. Elige uno para continuar.",
            );
            navigate("/");
          } else {
            // Caso 3: Ya pagó y está matriculado -> Entra directo a su Dashboard institucional
            navigate("/alumno");
          }
        } else {
          // Flujo normal para profesores, secretarias y administradores
          const ruta = rutasPorRol[rol] || "/";
          navigate(ruta);
        }
        // ================================================================
      } else {
        setError(result.error || "Email o contraseña incorrectos");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Error al conectar con el servidor");
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
          <h1 style={styles.title}>¡Bienvenido de vuelta!</h1>

          <div style={styles.icon}>🚗</div>

          {error && (
            <div style={styles.errorBox}>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          <form style={styles.form} onSubmit={handleLogin}>
            <div style={styles.field}>
              <label style={styles.label}>Correo</label>
              <input
                style={styles.input}
                type="email"
                placeholder="Ingresa tu correo"
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
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.loginButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
            >
              {loading ? "Cargando..." : "Iniciar sesión"}
            </button>

            <button
              type="button"
              style={styles.registerButton}
              disabled={loading}
              onClick={() => navigate("/registro")} // Redirigimos a la ruta de registro
            >
              Registrarse
            </button>
          </form>

          <div style={styles.testCredentials}>
            <p style={styles.smallText}>Credenciales de prueba:</p>
            <p style={styles.smallText}>
              👨‍🏫 Profesor - profesor@escuela.com / profesor123
            </p>
            <p style={styles.smallText}>
              👨‍🎓 Alumno - alumno@escuela.com / alumno123
            </p>
            <p style={styles.smallText}>
              📋 Secretaria - secretaria@escuela.com / secretaria123
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

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
    padding: "32px",
  },
  card: {
    width: "390px",
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
    marginBottom: "14px",
  },
  icon: {
    fontSize: "44px",
    marginBottom: "28px",
  },
  errorBox: {
    backgroundColor: "#fee",
    border: "1px solid #fcc",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "18px",
  },
  errorText: {
    color: "#c33",
    fontSize: "14px",
    margin: "0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  field: {
    textAlign: "left",
  },
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
  loginButton: {
    marginTop: "8px",
    backgroundColor: "#5a68d8",
    color: "white",
    border: "none",
    borderRadius: "999px",
    padding: "13px",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 5px 12px rgba(90,104,216,0.35)",
    transition: "all 0.3s ease",
  },
  registerButton: {
    backgroundColor: "#ff6b35",
    color: "white",
    border: "none",
    borderRadius: "999px",
    padding: "13px",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  testCredentials: {
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid #eee",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    padding: "12px",
  },
  smallText: {
    fontSize: "12px",
    color: "#666",
    margin: "4px 0",
  },
};

export default Login;
