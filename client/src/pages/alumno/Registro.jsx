import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/authService";

const Registro = () => {
  const navigate = useNavigate();

  // 1. Estados para todos los campos requeridos por tu backend
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");
  const [comuna, setComuna] = useState("");
  const [sexo, setSexo] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const backendUrl = "http://localhost:5000/api";

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 2. Validación estricta de campos vacíos antes de disparar al servidor
    if (
      !nombre.trim() ||
      !email.trim() ||
      !password ||
      !rut.trim() ||
      !telefono.trim() ||
      !comuna.trim() ||
      !sexo
    ) {
      setError("Por favor completa todos los campos del formulario");
      setLoading(false);
      return;
    }

    try {
      // 3. Petición al endpoint mandando el set completo de datos
      const res = await fetch(`${backendUrl}/alumnos/registro/auto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          password,
          rut,
          telefono,
          comuna,
          sexo,
        }),
      });

      const data = await res.json();

      if (data.success) {
        console.log("Registro exitoso de expediente de alumno");

        // Auto-loguear inmediatamente para capturar el token JWT
        const loginResult = await authService.login(email, password);

        if (loginResult.success) {
          const planPendiente = localStorage.getItem("plan_pendiente");

          if (planPendiente) {
            // Notificar plan de interés en tu ruta oficial /preferencia
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

            navigate(`/confirmar-plan?planId=${planPendiente}`);
          } else {
            alert(
              "¡Registro completado con éxito! Elige el plan con el que deseas matricularte.",
            );
            navigate("/");
          }
        } else {
          navigate("/login");
        }
      } else {
        setError(
          data.message ||
            "Error al crear la cuenta. Verifica que el RUT o Correo no estén registrados.",
        );
      }
    } catch (err) {
      console.error("Error en registro:", err);
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
          <h1 style={styles.title}>Crea tu cuenta de Alumno</h1>
          <p style={{ color: "#666", fontSize: "13px", marginBottom: "16px" }}>
            Ingresa tus datos para abrir tu ficha de conducción institucional
          </p>

          {error && (
            <div style={styles.errorBox}>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          <form style={styles.form} onSubmit={handleRegistro}>
            {/* Campo: Nombre Completo */}
            <div style={styles.field}>
              <label style={styles.label}>Nombre Completo</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Ej: Juan Pérez Muñoz"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Fila Doble: RUT y Teléfono */}
            <div style={styles.row}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>RUT</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="12345678-9"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Teléfono</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="988887777"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Fila Doble: Comuna y Sexo */}
            <div style={styles.row}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Comuna</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Ej: Concepción"
                  value={comuna}
                  onChange={(e) => setComuna(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Sexo / Género</label>
                <select
                  style={styles.select}
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Selecciona...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro / Prefiero no decir</option>
                </select>
              </div>
            </div>

            {/* Campo: Correo Electrónico */}
            <div style={styles.field}>
              <label style={styles.label}>Correo Electrónico</label>
              <input
                style={styles.input}
                type="email"
                placeholder="alumno@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Campo: Contraseña */}
            <div style={styles.field}>
              <label style={styles.label}>Contraseña</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Mínimo 6 caracteres"
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
              {loading
                ? "Validando con Base de Datos..."
                : "Registrarse y Contratar Plan"}
            </button>

            <div style={{ marginTop: "10px" }}>
              <span style={{ fontSize: "13px", color: "#666" }}>
                ¿Ya tienes tu cuenta lista?{" "}
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
// Estilos Optimizados (Se ensanchó la tarjeta a 460px para el diseño en grilla)
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
    padding: "20px",
  },
  card: {
    width: "460px",
    backgroundColor: "white",
    borderRadius: "18px",
    padding: "30px 34px",
    boxShadow: "0 14px 35px rgba(0,0,0,0.15)",
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#2c3e8f",
    marginBottom: "4px",
  },
  errorBox: {
    backgroundColor: "#fee",
    border: "1px solid #fcc",
    borderRadius: "8px",
    padding: "10px",
    marginBottom: "14px",
  },
  errorText: { color: "#c33", fontSize: "13px", margin: "0" },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  row: { display: "flex", gap: "16px" },
  field: { textAlign: "left" },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "700",
    color: "#2c3e8f",
    marginBottom: "4px",
  },
  input: {
    width: "100%",
    border: "none",
    borderBottom: "2px solid #8793d8",
    padding: "8px 4px",
    fontSize: "14px",
    outline: "none",
    color: "#2c3e8f",
    backgroundColor: "transparent",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    border: "none",
    borderBottom: "2px solid #8793d8",
    padding: "8px 0px",
    fontSize: "14px",
    outline: "none",
    color: "#2c3e8f",
    backgroundColor: "transparent",
    boxSizing: "border-box",
    cursor: "pointer",
  },
  registerButton: {
    marginTop: "10px",
    backgroundColor: "#ff6b35",
    color: "white",
    border: "none",
    borderRadius: "999px",
    padding: "13px",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 5px 12px rgba(255,107,53,0.3)",
    transition: "all 0.3s ease",
  },
};

export default Registro;
