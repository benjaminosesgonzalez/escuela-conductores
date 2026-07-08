import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const SecretariaDashboard = () => {
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
          <p style={styles.loadingText}>Cargando entorno de secretaría...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.layout}>
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span style={{ fontSize: "24px" }}>👤</span>
          <span>SECRETARÍA</span>
        </div>
        <nav style={styles.nav}>
          <Link
            to="/secretaria"
            style={{ ...styles.navItem, ...styles.navItemActive }}
          >
            <span>🏠</span> Inicio
          </Link>
          <div style={styles.navItem}>
            <span>👥</span> Alumnos
          </div>
          <div style={styles.navItem}>
            <span>📅</span> Horarios y clases
          </div>
          <div style={styles.navItem}>
            <span>🚗</span> Reservar Vehículo
          </div>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div style={styles.mainArea}>
        {/* BARRA SUPERIOR (TOPBAR) */}
        <header style={styles.topbar}>
          <div style={styles.topbarLeft}>
            <span style={styles.menuIcon}>☰</span>
            <span style={styles.topbarTitle}>ESCUELA DE CONDUCTORES</span>
          </div>
          <div style={styles.topbarRight}>
            <span style={styles.userGreeting}>
              {user?.name || "Sofía Ramirez"} 👤
            </span>
            <button style={styles.logoutButton} onClick={handleLogout}>
              Salir
            </button>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main style={styles.content}>
          <h1 style={styles.welcomeTitle}>
            Bienvenido, {user?.name?.split(" ")[0] || "Sofía"}
          </h1>

          {/* TARJETAS DE ESTADÍSTICAS */}
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>👥</div>
              <div style={styles.statLabel}>Alumnos registrados</div>
              <div style={styles.statNumber}>215</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📅</div>
              <div style={styles.statLabel}>Clases programadas hoy</div>
              <div style={styles.statNumber}>32</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>🚗</div>
              <div style={styles.statLabel}>Vehículos reservados hoy</div>
              <div style={styles.statNumber}>8</div>
            </div>
          </div>

          {/* GRID INFERIOR (3 COLUMNAS) */}
          <div style={styles.gridRow}>
            {/* Columna 1: Últimos alumnos */}
            <div style={styles.listCard}>
              <h2 style={styles.listHeader}>Últimos alumnos registrados</h2>
              <div style={styles.listItem}>
                <div style={styles.listInfo}>
                  <div style={styles.listAvatar}>👤</div>
                  <div>
                    <div style={styles.listName}>Pablo López</div>
                    <div style={styles.listDate}>15 de abr. de 2026</div>
                  </div>
                </div>
                <button style={styles.buttonPrimary}>Ver perfil</button>
              </div>
              <div style={styles.listItem}>
                <div style={styles.listInfo}>
                  <div style={styles.listAvatar}>👤</div>
                  <div>
                    <div style={styles.listName}>María Gómez</div>
                    <div style={styles.listDate}>17 de abr. de 2026</div>
                  </div>
                </div>
                <button style={styles.buttonPrimary}>Ver perfil</button>
              </div>
              <div style={styles.listItem}>
                <div style={styles.listInfo}>
                  <div style={styles.listAvatar}>👤</div>
                  <div>
                    <div style={styles.listName}>Andres Ruiz</div>
                    <div style={styles.listDate}>18 de abr. de 2026</div>
                  </div>
                </div>
                <button style={styles.buttonPrimary}>Ver perfil</button>
              </div>
              <button style={styles.buttonBlock}>Ver todos</button>
            </div>

            {/* Columna 2: Reservas de vehículos */}
            <div style={styles.listCard}>
              <h2 style={styles.listHeader}>Reservas de vehículos</h2>
              <div style={styles.bookingItem}>
                <div style={styles.bookingTimeTitle}>
                  9:00 a.m. - Toyota Yaris
                </div>
                <div style={styles.bookingDetail}>Instructor: Laura Rivera</div>
                <div style={styles.bookingDetail}>Lugar: San Pedro</div>
              </div>
              <div style={styles.bookingItem}>
                <div style={styles.bookingTimeTitle}>
                  10:00 a.m. - Kia Morning
                </div>
                <div style={styles.bookingDetail}>Instructor: Carlos Silva</div>
                <div style={styles.bookingDetail}>Lugar: San Pedro</div>
              </div>
              <div style={styles.bookingItem}>
                <div style={styles.bookingTimeTitle}>13:00 p.m. - Kia Rio</div>
                <div style={styles.bookingDetail}>Instructor: Jorge Pérez</div>
                <div style={styles.bookingDetail}>Lugar: San Pedro</div>
              </div>
            </div>

            {/* Columna 3: Tareas rápidas */}
            <div style={styles.listCard}>
              <h2 style={styles.listHeader}>Tareas rápidas</h2>
              <button style={styles.actionButton}>
                <span style={styles.actionIcon}>➕</span> Registrar alumno nuevo
              </button>
              <button style={styles.actionButton}>
                <span style={styles.actionIcon}>📅</span> Programar clase
              </button>
              <button style={styles.actionButton}>
                <span style={styles.actionIcon}>🚗</span> Reservar vehículo
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#d5dce8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#d5dce8",
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
    color: "#2c3e8f",
  },
  sidebar: {
    width: "260px",
    backgroundColor: "#8793d8",
    display: "flex",
    flexDirection: "column",
    boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
    zIndex: 10,
  },
  sidebarHeader: {
    padding: "24px",
    backgroundColor: "#4c5fd5",
    color: "white",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "18px",
    fontWeight: "bold",
  },
  nav: {
    padding: "20px 0",
    display: "flex",
    flexDirection: "column",
  },
  navItem: {
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "white",
    textDecoration: "none",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  navItemActive: {
    backgroundColor: "#4c5fd5",
    fontWeight: "bold",
    borderLeft: "4px solid white",
  },
  mainArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  topbar: {
    height: "70px",
    backgroundColor: "#8793d8",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 40px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  topbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    color: "white",
  },
  menuIcon: {
    fontSize: "24px",
    cursor: "pointer",
  },
  topbarTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    letterSpacing: "1px",
  },
  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  userGreeting: {
    color: "white",
    fontWeight: "600",
    fontSize: "16px",
  },
  logoutButton: {
    backgroundColor: "transparent",
    color: "white",
    border: "1px solid white",
    padding: "6px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  content: {
    padding: "32px 40px",
    flex: 1,
    overflowY: "auto",
  },
  welcomeTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "24px",
    color: "#2c3e8f",
  },
  statsRow: {
    display: "flex",
    gap: "24px",
    marginBottom: "32px",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#4c5fd5",
    color: "white",
    padding: "24px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 6px 16px rgba(76, 95, 213, 0.2)",
  },
  statIcon: {
    fontSize: "32px",
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "15px",
    fontWeight: "600",
    opacity: 0.9,
  },
  statNumber: {
    fontSize: "36px",
    fontWeight: "bold",
    marginTop: "12px",
  },
  gridRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
  },
  listCard: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  listHeader: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#4c5fd5",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #eef0f6",
  },
  listInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  listAvatar: {
    fontSize: "24px",
    backgroundColor: "#d5dce8",
    padding: "8px",
    borderRadius: "50%",
  },
  listName: {
    fontWeight: "bold",
    fontSize: "14px",
    color: "#2c3e8f",
  },
  listDate: {
    fontSize: "12px",
    color: "#888",
    marginTop: "4px",
  },
  buttonPrimary: {
    backgroundColor: "#4c5fd5",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "12px",
  },
  buttonBlock: {
    width: "100%",
    backgroundColor: "#2c3e8f",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "16px",
  },
  bookingItem: {
    backgroundColor: "#f5f7fb",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "12px",
    borderLeft: "4px solid #4c5fd5",
  },
  bookingTimeTitle: {
    fontWeight: "bold",
    fontSize: "14px",
    color: "#2c3e8f",
    marginBottom: "8px",
  },
  bookingDetail: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "4px",
  },
  actionButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "16px",
    backgroundColor: "#f5f7fb",
    color: "#2c3e8f",
    border: "none",
    borderRadius: "8px",
    marginBottom: "12px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
    transition: "background-color 0.2s",
  },
  actionIcon: {
    fontSize: "18px",
  },
};

export default SecretariaDashboard;
