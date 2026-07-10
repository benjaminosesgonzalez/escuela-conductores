import React, { useState } from "react";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import { spacing, colors } from "../../theme/index.js";

const Layout = ({
  children,
  menuItems,
  activeTab,
  onMenuClick,
  userEmail,
  onLogout,
  roleColor = colors.primary,
  roleIcon,
  roleLabel = "Usuario",
  title = "ESCUELA DE CONDUCTORES",
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: colors.background,
      }}
    >
      {/* SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        menuItems={menuItems}
        activeTab={activeTab}
        onMenuClick={onMenuClick}
        roleColor={roleColor}
        roleIcon={roleIcon}
      />

      {/* MAIN CONTENT */}
      <div
        style={{
          marginLeft: sidebarOpen ? "340px" : "80px",
          flex: 1,
          transition: "margin-left 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* HEADER */}
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userEmail={userEmail}
          onLogout={onLogout}
          roleLabel={roleLabel}
          title={title}
        />

        {/* CONTENT */}
        <div
          style={{
            flex: 1,
            padding: spacing.padding.xlarge,
            overflowY: "auto",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
