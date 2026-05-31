import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (err) {
      console.error("Error al parsear usuario:", err);
      navigate("/login");
    }

    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <p style={styles.loadingText}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <div style={styles.logo}>ESCUELA DE CONDUCTORES</div>
        </Link>

        <div style={styles.headerRight}>
          <span style={styles.userGreeting}>
            👋 ¡Hola, {user?.name || user?.email}!
          </span>
          <button style={styles.logoutButton} onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.container}>
          <section style={styles.welcomeCard}>
            <h1 style={styles.title}>Bienvenido al Dashboard</h1>
            <p style={styles.subtitle}>
              Aquí puedes ver tus clases, historial y progreso
            </p>
          </section>

          <div style={styles.grid}>
            <div style={styles.card}>
              <div style={styles.cardIcon}>📚</div>
              <h2 style={styles.cardTitle}>Mis Clases</h2>
              <p style={styles.cardText}>
                Próximas clases y horarios disponibles
              </p>
              <button style={styles.cardButton}>Ver clases</button>
            </div>

            <div style={styles.card}>
              <div style={styles.cardIcon}>📈</div>
              <h2 style={styles.cardTitle}>Mi Progreso</h2>
              <p style={styles.cardText}>
                Sigue tu avance en el curso
              </p>
              <button style={styles.cardButton}>Ver progreso</button>
            </div>

            <div style={styles.card}>
              <div style={styles.cardIcon}>📄</div>
              <h2 style={styles.cardTitle}>Documentos</h2>
              <p style={styles.cardText}>
                Descarga tus certificados y documentos
              </p>
              <button style={styles.cardButton}>Ver documentos</button>
            </div>

            <div style={styles.card}>
              <div style={styles.cardIcon}>💬</div>
              <h2 style={styles.cardTitle}>Soporte</h2>
              <p style={styles.cardText}>
                Contacta con nuestro equipo de soporte
              </p>
              <button style={styles.cardButton}>Contactar</button>
            </div>
          </div>

          <section style={styles.infoSection}>
            <h2 style={styles.sectionTitle}>Tu Información</h2>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Email:</label>
                <p style={styles.infoValue}>{user?.email || "No disponible"}</p>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Plan:</label>
                <p style={styles.infoValue}>{user?.plan || "No asignado"}</p>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Fecha de registro:</label>
                <p style={styles.infoValue}>
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "No disponible"}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          © 2024 Escuela de Conductores. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#d5dce8",
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
    color: "#243b91",
    display: "flex",
    flexDirection: "column",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
  },
  loadingText: {
    fontSize: "18px",
    color: "#2c3e8f",
  },
  header: {
    backgroundColor: "#8793d8",
    padding: "24px 60px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  },
  logo: {
    backgroundColor: "#4c5fd5",
    color: "white",
    padding: "14px 28px",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  userGreeting: {
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#ff6b35",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  main: {
    flex: 1,
    padding: "40px 60px",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  welcomeCard: {
    backgroundColor: "#7d88d1",
    color: "white",
    padding: "40px",
    borderRadius: "16px",
    marginBottom: "40px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
  },
  title: {
    fontSize: "36px",
    fontWeight: "800",
    margin: "0 0 12px 0",
  },
  subtitle: {
    fontSize: "16px",
    margin: "0",
    opacity: 0.9,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
    marginBottom: "40px",
  },
  card: {
    backgroundColor: "white",
    padding: "28px 24px",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
  },
  cardIcon: {
    fontSize: "40px",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#2c3e8f",
    margin: "0 0 12px 0",
  },
  cardText: {
    fontSize: "14px",
    color: "#666",
    margin: "0 0 18px 0",
    minHeight: "40px",
  },
  cardButton: {
    backgroundColor: "#5a68d8",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "999px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  infoSection: {
    backgroundColor: "white",
    padding: "32px",
    borderRadius: "16px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#2c3e8f",
    margin: "0 0 24px 0",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
  },
  infoItem: {
    padding: "16px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
  },
  infoLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#666",
    display: "block",
    marginBottom: "6px",
  },
  infoValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2c3e8f",
    margin: "0",
  },
  footer: {
    backgroundColor: "#d5dce8",
    padding: "20px 60px",
    textAlign: "center",
    borderTop: "1px solid rgba(0,0,0,0.08)",
  },
  footerText: {
    fontSize: "13px",
    color: "#666",
    margin: "0",
  },
};

export default Dashboard;