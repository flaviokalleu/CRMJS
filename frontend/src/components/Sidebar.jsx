import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiMenu } from "react-icons/hi";
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
import { useAuth } from "../context/AuthContext"; // Ajuste o caminho conforme necessário

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
          icon: <FaUserPlus size={20} />,
          label: "Adicionar Cliente",
        },
        {
          to: "/alugueis/adicionar",
          icon: <FaHome size={20} />,
          label: "Adicionar Aluguel",
        },
      ],
      listItems: [
        {
          to: "/clientes/lista",
          icon: <FaListUl size={20} />,
          label: "Lista Clientes",
        },
        {
          to: "/imoveis/lista",
          icon: <FaClipboardList size={20} />,
          label: "Lista Imóveis",
        },
        {
          to: "/alugueis",
          icon: <FaClipboardList size={20} />,
          label: "Lista de Aluguéis",
        },
      ],
      extraItems: [
        {
          to: "/dashboard",
          icon: <FaQrcode size={20} />,
          label: "Dashboard",
        },
      ],
    },
    {
      role: "Administrador",
      addItems: [
        {
          to: "/clientes/adicionar",
          icon: <FaUserPlus size={20} />,
          label: "Adicionar Cliente",
        },
        {
          to: "/corretores/adicionar",
          icon: <FaUserTie size={20} />,
          label: "Adicionar Corretor",
        },
        {
          to: "/correspondentes/adicionar",
          icon: <FaUserShield size={20} />,
          label: "Adicionar Correspondente",
        },
        {
          to: "/imoveis/adicionar",
          icon: <FaBuilding size={20} />,
          label: "Adicionar Imóvel",
        },
        {
          to: "/alugueis/adicionar",
          icon: <FaHome size={20} />,
          label: "Adicionar Aluguel",
        },
      ],
      listItems: [
        {
          to: "/proprietarios/lista",
          icon: <FaListAlt size={20} />,
          label: "Lista Proprietários",
        },
        {
          to: "/lembretes",
          icon: <FaListAlt size={20} />,
          label: "Lembretes",
        },
        {
          to: "/clientes/lista",
          icon: <FaListUl size={20} />,
          label: "Lista Clientes",
        },
        {
          to: "/imoveis/lista",
          icon: <FaClipboardList size={20} />,
          label: "Lista Imóveis",
        },
        {
          to: "/corretores/lista",
          icon: <FaUsersCog size={20} />,
          label: "Lista Corretores",
        },
        {
          to: "/correspondentes/lista",
          icon: <FaUserFriends size={20} />,
          label: "Lista Correspondentes",
        },

        {
          to: "/alugueis",
          icon: <FaClipboardList size={20} />,
          label: "Lista de Aluguéis",
        },
      ],
      extraItems: [
        {
          to: "/dashboard",
          icon: <FaQrcode size={20} />,
          label: "Dashboard",
        },
        {
          to: "/whatsapp-qr",
          icon: <FaQrcode size={20} />,
          label: "Escanear QR Code",
        },
        {
          to: "/clientes-aluguel", // Adicionando o novo item
          icon: <FaClipboardList size={20} />,
          label: "Clientes de Aluguel",
        },
        {
          to: "/relatorio", // Adicionando o novo item
          icon: <FaClipboardList size={20} />,
          label: "Relatorio",
        },
        {
          to: "/acessos",
          icon: <FaQrcode size={20} />,
          label: "Acessos List",
        },
      ],
    },
    {
      role: "Correspondente",

      addItems: [
        {
          to: "/alugueis/adicionar",
          icon: <FaHome size={20} />,
          label: "Adicionar Aluguel",
        },
      ],
      listItems: [
        {
          to: "/proprietarios/lista",
          icon: <FaListAlt size={20} />,
          label: "Lista Proprietários",
        },
        {
          to: "/clientes/lista",
          icon: <FaListUl size={20} />,
          label: "Lista Clientes",
        },
        {
          to: "/imoveis/lista",
          icon: <FaClipboardList size={20} />,
          label: "Lista Imóveis",
        },
        {
          to: "/alugueis",
          icon: <FaClipboardList size={20} />,
          label: "Aluguéis",
        },
      ],
      extraItems: [
        {
          to: "/dashboard",
          icon: <FaQrcode size={20} />,
          label: "Dashboard",
        },
      ],
    },
  ];

  const currentMenuItems = menuItems.find((menu) => menu.role === user?.role);

  return (
    <div
      className={`fixed inset-0 top-0 left-0 transition-transform transform ${
        open ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 bg-gray-800 text-white w-64 h-full z-50 overflow-y-auto`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700 lg:hidden">
          <div className="text-xl font-semibold">Logo</div>
          <button
            onClick={handleDrawerClose}
            className="text-gray-400 hover:text-white"
          >
            <HiMenu size={24} />
          </button>
        </div>
        <div className="flex items-center p-4 bg-gray-900 border-b border-gray-700">
          <img
            src={
              user?.photo
                ? `${apiBaseUrl}/uploads/imagem_${user?.role}/${user.photo}`
                : "https://via.placeholder.com/150"
            }
            alt="User"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="ml-3">
            <div className="text-sm font-semibold">
              {user?.first_name || "Nome do Usuário"}
            </div>
            <div className="text-xs text-gray-400">
              {user?.role || "Função do Usuário"}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Tempo restante do token:{" "}
              <button className="bg-red-600 text-white px-3 py-1 rounded-lg">
                {timeRemaining}
              </button>
            </div>
          </div>
        </div>
        <nav className="mt-4 flex-1">
          <ul className="space-y-2">
            {/* Seção extra com "Escanear QR Code" */}
            {currentMenuItems?.extraItems?.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.to}
                  className="flex items-center p-4 hover:bg-gray-700 rounded-lg"
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              </li>
            ))}

            {/* Seção Adicionar */}
            <li>
              <button
                onClick={() => setAddDropdownOpen(!addDropdownOpen)}
                className="flex items-center p-4 w-full text-left hover:bg-gray-700 rounded-lg"
              >
                <FaUserPlus size={20} />
                <span className="ml-3">Adicionar</span>
              </button>
              {addDropdownOpen && (
                <ul className="pl-6 space-y-2">
                  {currentMenuItems?.addItems?.map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.to}
                        className="flex items-center p-4 hover:bg-gray-600 rounded-lg"
                      >
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Seção Lista */}
            <li>
              <button
                onClick={() => setListDropdownOpen(!listDropdownOpen)}
                className="flex items-center p-4 w-full text-left hover:bg-gray-700 rounded-lg"
              >
                <FaListAlt size={20} />
                <span className="ml-3">Lista</span>
              </button>
              {listDropdownOpen && (
                <ul className="pl-6 space-y-2">
                  {currentMenuItems?.listItems?.map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.to}
                        className="flex items-center p-4 hover:bg-gray-600 rounded-lg"
                      >
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Configurações e Logout */}
            <li>
              <Link
                to="/configuracoes"
                className="flex items-center p-4 hover:bg-gray-700 rounded-lg"
              >
                <FaCog size={20} />
                <span className="ml-3">Configurações</span>
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center p-4 hover:bg-gray-700 rounded-lg w-full text-left"
              >
                <FaSignOutAlt size={20} />
                <span className="ml-3">Sair</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
