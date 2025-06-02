import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiMenu,
  HiChevronDown,
  HiChevronRight,
} from "react-icons/hi";
import {
  FaHome,
  FaUserPlus,
  FaUserTie,
  FaUserShield,
  FaBuilding,
  FaListAlt,
  FaListUl,
  FaClipboardList,
  FaUsersCog,
  FaUserFriends,
  FaSignOutAlt,
  FaCog,
  FaQrcode,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ open, handleDrawerClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [timeRemaining, setTimeRemaining] = useState("N/A");
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [listDropdownOpen, setListDropdownOpen] = useState(false);

  const apiBaseUrl = process.env.REACT_APP_API_URL;

  const calculateTimeRemaining = () => {
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    if (!tokenExpiry) return "N/A";
    const now = new Date().getTime();
    const expiryTime = parseInt(tokenExpiry, 10);
    const timeDiff = expiryTime - now;

    if (timeDiff <= 0) return "Expirado";

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}m ${remainingSeconds}s`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      role: "corretor",
      addItems: [
        {
          to: "/clientes/adicionar",
          icon: <FaUserPlus size={18} />,
          label: "Adicionar Cliente",
        },
        {
          to: "/alugueis/adicionar",
          icon: <FaHome size={18} />,
          label: "Adicionar Aluguel",
        },
      ],
      listItems: [
        {
          to: "/clientes/lista",
          icon: <FaListUl size={18} />,
          label: "Lista Clientes",
        },
        {
          to: "/imoveis/lista",
          icon: <FaClipboardList size={18} />,
          label: "Lista Imóveis",
        },
        {
          to: "/alugueis",
          icon: <FaClipboardList size={18} />,
          label: "Lista de Aluguéis",
        },
      ],
      extraItems: [
        {
          to: "/dashboard",
          icon: <FaQrcode size={18} />,
          label: "Dashboard",
        },
      ],
    },
    {
      role: "Administrador",
      addItems: [
        {
          to: "/clientes/adicionar",
          icon: <FaUserPlus size={18} />,
          label: "Adicionar Cliente",
        },
        {
          to: "/corretores/adicionar",
          icon: <FaUserTie size={18} />,
          label: "Adicionar Corretor",
        },
        {
          to: "/correspondentes/adicionar",
          icon: <FaUserShield size={18} />,
          label: "Adicionar Correspondente",
        },
        {
          to: "/imoveis/adicionar",
          icon: <FaBuilding size={18} />,
          label: "Adicionar Imóvel",
        },
        {
          to: "/alugueis/adicionar",
          icon: <FaHome size={18} />,
          label: "Adicionar Aluguel",
        },
      ],
      listItems: [
        {
          to: "/proprietarios/lista",
          icon: <FaListAlt size={18} />,
          label: "Lista Proprietários",
        },
        {
          to: "/lembretes",
          icon: <FaListAlt size={18} />,
          label: "Lembretes",
        },
        {
          to: "/clientes/lista",
          icon: <FaListUl size={18} />,
          label: "Lista Clientes",
        },
        {
          to: "/imoveis/lista",
          icon: <FaClipboardList size={18} />,
          label: "Lista Imóveis",
        },
        {
          to: "/corretores/lista",
          icon: <FaUsersCog size={18} />,
          label: "Lista Corretores",
        },
        {
          to: "/correspondentes/lista",
          icon: <FaUserFriends size={18} />,
          label: "Lista Correspondentes",
        },
        {
          to: "/alugueis",
          icon: <FaClipboardList size={18} />,
          label: "Lista de Aluguéis",
        },
      ],
      extraItems: [
        {
          to: "/dashboard",
          icon: <FaQrcode size={18} />,
          label: "Dashboard",
        },
        {
          to: "/whatsapp-qr",
          icon: <FaQrcode size={18} />,
          label: "Escanear QR Code",
        },
        {
          to: "/clientes-aluguel",
          icon: <FaClipboardList size={18} />,
          label: "Clientes de Aluguel",
        },
        {
          to: "/relatorio",
          icon: <FaClipboardList size={18} />,
          label: "Relatorio",
        },
        {
          to: "/acessos",
          icon: <FaQrcode size={18} />,
          label: "Acessos List",
        },
      ],
    },
    {
      role: "Correspondente",
      addItems: [
        {
          to: "/alugueis/adicionar",
          icon: <FaHome size={18} />,
          label: "Adicionar Aluguel",
        },
      ],
      listItems: [
        {
          to: "/proprietarios/lista",
          icon: <FaListAlt size={18} />,
          label: "Lista Proprietários",
        },
        {
          to: "/clientes/lista",
          icon: <FaListUl size={18} />,
          label: "Lista Clientes",
        },
        {
          to: "/imoveis/lista",
          icon: <FaClipboardList size={18} />,
          label: "Lista Imóveis",
        },
        {
          to: "/alugueis",
          icon: <FaClipboardList size={18} />,
          label: "Aluguéis",
        },
      ],
      extraItems: [
        {
          to: "/dashboard",
          icon: <FaQrcode size={18} />,
          label: "Dashboard",
        },
      ],
    },
  ];

  const currentMenuItems = menuItems.find((menu) => menu.role === user?.role);

  // Elegant MenuItem component for consistent styling
  const MenuItem = ({ to, icon, label, onClick, isDropdown = false, openDropdown }) => (
    <li className="mb-1">
      {to ? (
        <Link
          to={to}
          className="flex items-center px-4 py-3 text-sm transition-all duration-200 rounded-lg hover:bg-blue-900/70 text-blue-100 hover:text-blue-400 font-medium"
        >
          <span className="text-blue-400">{icon}</span>
          <span className="ml-3">{label}</span>
        </Link>
      ) : (
        <button
          onClick={onClick}
          className="flex items-center justify-between w-full px-4 py-3 text-sm transition-all duration-200 rounded-lg hover:bg-blue-900/70 text-blue-100 hover:text-blue-400 font-medium"
        >
          <div className="flex items-center">
            <span className="text-blue-400">{icon}</span>
            <span className="ml-3">{label}</span>
          </div>
          {isDropdown && (
            <span className="text-blue-400">
              {openDropdown ? <HiChevronDown size={16} /> : <HiChevronRight size={16} />}
            </span>
          )}
        </button>
      )}
    </li>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 lg:hidden z-40"
          onClick={handleDrawerClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-0 top-0 left-0 transition-transform transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 bg-gradient-to-b from-blue-950 via-blue-900 to-black text-white w-64 h-full z-50 overflow-y-auto shadow-2xl border-r border-blue-900/40`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 bg-blue-950 border-b border-blue-900/40 lg:hidden">
            <div className="text-blue-400 font-semibold text-lg">Imobiliária</div>
            <button
              onClick={handleDrawerClose}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <HiMenu size={24} />
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center p-6 bg-blue-950 border-b border-blue-900/40">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-blue-400 overflow-hidden shadow-lg">
                <img
                  src={
                    user?.photo
                      ? `${apiBaseUrl}/uploads/imagem_${user?.role}/${user.photo}`
                      : "https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=User"
                  }
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-blue-950"></div>
            </div>
            <div className="ml-3">
              <div className="font-semibold text-blue-300 text-base">
                {user?.first_name || "Usuário"}
              </div>
              <div className="text-xs text-blue-200">
                {user?.role || "Função"}
              </div>
              <div className="text-xs text-blue-400 mt-1 flex items-center">
                <span className="mr-2">Token:</span>
                <span className="bg-blue-950 border border-blue-400 text-blue-400 px-2 py-0.5 rounded text-xs font-mono">
                  {timeRemaining}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-4 flex-1 px-2">
            <ul className="space-y-1">
              {/* Extra Items Section */}
              {currentMenuItems?.extraItems?.map((item, index) => (
                <MenuItem
                  key={`extra-${index}`}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                />
              ))}

              {/* Divider */}
              <li className="my-4 border-t border-blue-900/40"></li>

              {/* Add Section */}
              <MenuItem
                icon={<FaUserPlus size={18} />}
                label="Adicionar"
                onClick={() => setAddDropdownOpen(!addDropdownOpen)}
                isDropdown={true}
                openDropdown={addDropdownOpen}
              />

              {addDropdownOpen && (
                <ul className="ml-4 mt-1 border-l border-blue-900/40 pl-2">
                  {currentMenuItems?.addItems?.map((item, index) => (
                    <MenuItem
                      key={`add-${index}`}
                      to={item.to}
                      icon={item.icon}
                      label={item.label}
                    />
                  ))}
                </ul>
              )}

              {/* List Section */}
              <MenuItem
                icon={<FaListAlt size={18} />}
                label="Lista"
                onClick={() => setListDropdownOpen(!listDropdownOpen)}
                isDropdown={true}
                openDropdown={listDropdownOpen}
              />

              {listDropdownOpen && (
                <ul className="ml-4 mt-1 border-l border-blue-900/40 pl-2">
                  {currentMenuItems?.listItems?.map((item, index) => (
                    <MenuItem
                      key={`list-${index}`}
                      to={item.to}
                      icon={item.icon}
                      label={item.label}
                    />
                  ))}
                </ul>
              )}

              {/* Divider */}
              <li className="my-4 border-t border-blue-900/40"></li>

              {/* Settings and Logout */}
              <MenuItem
                to="/configuracoes"
                icon={<FaCog size={18} />}
                label="Configurações"
              />

              <MenuItem
                icon={<FaSignOutAlt size={18} />}
                label="Sair"
                onClick={handleLogout}
              />
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 mt-auto text-center text-xs text-blue-300 border-t border-blue-900/40 bg-blue-950">
            &copy; {new Date().getFullYear()} Imobiliária Premium
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;