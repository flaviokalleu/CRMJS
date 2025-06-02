import React, { useState, useEffect } from "react";
import { FiMenu } from "react-icons/fi"; // Using Feather Icons
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if screen is mobile on mount and window resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Set initial sidebar state based on screen size
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 to-black">
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900/80 backdrop-blur-md 
          transition-transform duration-300 ease-in-out border-r border-gray-800/50
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <Sidebar
          open={sidebarOpen}
          onClose={() => isMobile && setSidebarOpen(false)}
        />
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50">
          <div className="">
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <FiMenu className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        </header>

        {/* Content Area - Now expands properly */}
        <div className="flex-1 w-full">
          {/* Mobile Overlay */}
          {isMobile && sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content - Full width and height */}
          <div className="h-full w-full">{children}</div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900/80 backdrop-blur-md border-t border-gray-800/50">
          <Footer />
        </footer>
      </main>
    </div>
  );
};

export default MainLayout;