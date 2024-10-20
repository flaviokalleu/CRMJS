import React from "react";
import { useAuth } from "../context/AuthContext";
import DashboardCorretor from "./Dashboard/DashboardCorretor";
import DashboardCorrespondente from "./Dashboard/DashboardCorrespondente";
import DashboardAdministrador from "./Dashboard/DashboardAdministrador";

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <p>Carregando...</p>;
  }

  const renderDashboardByRole = () => {
    switch (user.role) {
      case "corretor":
        return <DashboardCorretor />;
      case "Correspondente":
        return <DashboardCorrespondente />;
      case "Administrador":
        return <DashboardAdministrador />;
      default:
        return <p>Você não tem permissão para acessar esse dashboard.</p>;
    }
  };

  return <div className="dashboard-container">{renderDashboardByRole()}</div>;
};

export default Dashboard;
