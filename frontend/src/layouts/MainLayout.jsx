import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar open={sidebarOpen} handleDrawerClose={toggleSidebar} />
      <div
        className={`flex-1 transition-transform duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        } bg-gray-800`}
      >
        <div className="relative">
          {/* Botão de Menu para dispositivos móveis */}
          {!sidebarOpen && (
            <button
              className="lg:hidden fixed top-4 left-4 text-white bg-gray-700 p-2 rounded-md hover:bg-gray-600 z-50"
              onClick={toggleSidebar}
            >
              ☰
            </button>
          )}
          <div className="flex items-center p-4 bg-gray-900">
            <div
              className={`flex-grow ${sidebarOpen ? "ml-64" : "ml-0"} lg:ml-64`}
            >
              {/* Container para o conteúdo principal */}
              <div className="container mx-auto p-4">{children}</div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
