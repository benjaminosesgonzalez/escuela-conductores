import React from "react";

const Login = ({ onBack }) => {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button style={styles.logo} onClick={onBack}>
          ESCUELA DE CONDUCTORES
        </button>
      </header>

      <main style={styles.main}>
        <section style={styles.card}>
          <h1 style={styles.title}>¡Bienvenido de vuelta!</h1>

          <div style={styles.icon}>🚗</div>

          <form style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Correo</label>
              <input
                style={styles.input}
                type="email"
                placeholder="Ingresa tu correo"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Contraseña</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Ingresa tu contraseña"
              />
            </div>

            <button type="button" style={styles.loginButton}>
              Iniciar sesión
            </button>

            <button type="button" style={styles.registerButton}>
              Registrarse
            </button>
          </form>
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
    cursor: "pointer",
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
  },
};

export default Login;