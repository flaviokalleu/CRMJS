import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  FaChartBar,
  FaTachometerAlt,
  FaUsers,
  FaBell,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ open, handleDrawerClose }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const [timeRemaining, setTimeRemaining] = useState("N/A");
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [listDropdownOpen, setListDropdownOpen] = useState(false);

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

  // Função para determinar o papel principal do usuário para exibição
  const getUserDisplayRole = () => {
    if (hasRole('administrador')) return 'Administrador';
    if (hasRole('correspondente')) return 'Correspondente';
    if (hasRole('corretor')) return 'Corretor';
    return 'Usuário';
  };

  // Função para determinar o diretório correto da foto baseado no papel do usuário
  const getUserPhotoDirectory = () => {
    // Prioridade: Administrador > Correspondente > Corretor > Default
    if (hasRole('administrador')) {
      return 'imagem_administrador'; // ou 'administrador' se tiver um diretório específico
    }
    if (hasRole('correspondente')) {
      return 'imagem_correspondente';
    }
    if (hasRole('corretor')) {
      return 'corretor';
    }
    return 'imagem_user'; // Diretório padrão
  };

  // Função para gerar a URL da foto do usuário
  const getUserPhotoUrl = () => {
    if (!user?.photo) {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name || 'default'}&backgroundColor=1d4ed8`;
    }

    const photoDirectory = getUserPhotoDirectory();
    return `${process.env.REACT_APP_API_URL}/uploads/${photoDirectory}/${user.photo}`;
  };

  // Função de fallback para erro de carregamento da imagem
  const handleImageError = (e) => {
    e.target.onerror = null; // Previne loop infinito
    
    // Lista de diretórios para tentar como fallback
    const fallbackDirectories = ['imagem_user', 'corretor', 'correspondente'];
    const currentSrc = e.target.src;
    
    // Encontrar o próximo diretório para testar
    for (let i = 0; i < fallbackDirectories.length; i++) {
      const dir = fallbackDirectories[i];
      const testUrl = `${process.env.REACT_APP_API_URL}/uploads/${dir}/${user.photo}`;
      
      if (!currentSrc.includes(dir)) {
        e.target.src = testUrl;
        return;
      }
    }
    
    // Se todos falharam, usar avatar gerado
    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name || 'default'}&backgroundColor=1d4ed8`;
  };

  // Configuração de itens do menu baseada nos papéis
  const getMenuItems = () => {
    const items = {
      addItems: [],
      listItems: [],
      extraItems: []
    };

    // Dashboard disponível para todos
    items.extraItems.push({
      to: "/dashboard",
      icon: <FaTachometerAlt size={18} />,
      label: "Dashboard",
    });

    // Itens para Corretor
    if (hasRole('corretor')) {
      items.addItems.push(
        {
          to: "/clientes/adicionar",
          icon: <FaUserPlus size={18} />,
          label: "Adicionar Cliente",
        },
        {
          to: "/alugueis/adicionar",
          icon: <FaHome size={18} />,
          label: "Adicionar Aluguel",
        }
      );

      items.listItems.push(
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
        }
      );
    }

    // Itens para Correspondente
    if (hasRole('correspondente')) {
      // Adicionar itens específicos do correspondente
      if (!items.addItems.some(item => item.to === "/alugueis/adicionar")) {
        items.addItems.push({
          to: "/alugueis/adicionar",
          icon: <FaHome size={18} />,
          label: "Adicionar Aluguel",
        });
      }

      // Adicionar listas se não existirem
      const correspondentListItems = [
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
        }
      ];

      correspondentListItems.forEach(item => {
        if (!items.listItems.some(existing => existing.to === item.to)) {
          items.listItems.push(item);
        }
      });
    }

    // Itens para Administrador
    if (hasRole('administrador')) {
      // Adicionar todos os itens de adição
      const adminAddItems = [
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
        }
      ];

      adminAddItems.forEach(item => {
        if (!items.addItems.some(existing => existing.to === item.to)) {
          items.addItems.push(item);
        }
      });

      // Adicionar todas as listas
      const adminListItems = [
        {
          to: "/proprietarios/lista",
          icon: <FaListAlt size={18} />,
          label: "Lista Proprietários",
        },
        {
          to: "/lembretes",
          icon: <FaBell size={18} />,
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
        }
      ];

      adminListItems.forEach(item => {
        if (!items.listItems.some(existing => existing.to === item.to)) {
          items.listItems.push(item);
        }
      });

      // Itens extras para administrador
      const adminExtraItems = [
        {
          to: "/whatsapp-qr",
          icon: <FaQrcode size={18} />,
          label: "Escanear QR Code",
        },
        {
          to: "/clientes-aluguel",
          icon: <FaUsers size={18} />,
          label: "Clientes de Aluguel",
        },
        {
          to: "/relatorio",
          icon: <FaChartBar size={18} />,
          label: "Relatório",
        },
        {
          to: "/acessos",
          icon: <FaUsersCog size={18} />,
          label: "Acessos List",
        }
      ];

      adminExtraItems.forEach(item => {
        if (!items.extraItems.some(existing => existing.to === item.to)) {
          items.extraItems.push(item);
        }
      });
    }

    return items;
  };

  const menuItems = getMenuItems();

  // Animation variants
  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  const dropdownVariants = {
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        height: {
          duration: 0.3
        },
        opacity: {
          duration: 0.2,
          delay: 0.1
        }
      }
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        height: {
          duration: 0.3
        },
        opacity: {
          duration: 0.2
        }
      }
    }
  };

  // Elegant MenuItem component for consistent styling
  const MenuItem = ({ to, icon, label, onClick, isDropdown = false, openDropdown }) => (
    <motion.li 
      className="mb-1"
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      {to ? (
        <Link
          to={to}
          className="flex items-center px-4 py-3 text-sm transition-all duration-300 rounded-xl hover:bg-blue-900/30 text-blue-100 hover:text-white font-medium group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
          <span className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300 relative z-10">{icon}</span>
          <span className="ml-3 relative z-10">{label}</span>
        </Link>
      ) : (
        <button
          onClick={onClick}
          className="flex items-center justify-between w-full px-4 py-3 text-sm transition-all duration-300 rounded-xl hover:bg-blue-900/30 text-blue-100 hover:text-white font-medium group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
          <div className="flex items-center relative z-10">
            <span className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300">{icon}</span>
            <span className="ml-3">{label}</span>
          </div>
          {isDropdown && (
            <motion.span 
              className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300 relative z-10"
              animate={{ rotate: openDropdown ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <HiChevronRight size={16} />
            </motion.span>
          )}
        </button>
      )}
    </motion.li>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-40"
            onClick={handleDrawerClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={open ? "open" : "closed"}
        className="fixed inset-0 top-0 left-0 lg:translate-x-0 bg-gradient-to-b from-gray-950 via-blue-950 to-gray-900 text-white w-64 h-full z-50 overflow-y-auto shadow-2xl border-r border-blue-500/20"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="absolute bottom-20 right-5 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
        </div>

        <div className="flex flex-col h-full relative z-10">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 bg-gray-950/50 backdrop-blur-md border-b border-blue-500/20 lg:hidden">
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold text-lg">
              CRM Premium
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDrawerClose}
              className="text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-blue-900/30"
            >
              <HiMenu size={24} />
            </motion.button>
          </div>

          {/* User Profile */}
          <div className="flex items-center p-6 bg-gray-950/30 backdrop-blur-md border-b border-blue-500/20">
            <div className="relative">
              <motion.div 
                className="w-14 h-14 rounded-full border-2 border-blue-400/50 overflow-hidden shadow-lg bg-gradient-to-br from-blue-500 to-purple-600"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={getUserPhotoUrl()}
                  alt="User"
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </motion.div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-950 shadow-lg"></div>
              
              {/* Debug info - Remove in production */}
              {process.env.NODE_ENV === 'development' && user?.photo && (
                <div className="absolute -top-8 left-0 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                  Dir: {getUserPhotoDirectory()}
                </div>
              )}
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <div className="font-semibold text-white text-base truncate">
                {user?.first_name || "Usuário"} {user?.last_name || ""}
              </div>
              <div className="text-xs text-blue-300 truncate">
                {getUserDisplayRole()}
              </div>
              
              {/* Role Badges */}
              <div className="flex flex-wrap gap-1 mt-2">
                {hasRole('administrador') && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
                    Admin
                  </span>
                )}
                {hasRole('correspondente') && (
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                    Corresp
                  </span>
                )}
                {hasRole('corretor') && (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                    Corretor
                  </span>
                )}
              </div>

              <div className="text-xs text-blue-400 mt-2 flex items-center">
                <span className="mr-2">Token:</span>
                <span className="bg-blue-950/50 border border-blue-400/30 text-blue-300 px-2 py-0.5 rounded-lg text-xs font-mono">
                  {timeRemaining}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-4 flex-1 px-3">
            <ul className="space-y-2">
              {/* Extra Items Section */}
              {menuItems.extraItems.map((item, index) => (
                <MenuItem
                  key={`extra-${index}`}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                />
              ))}

              {/* Divider */}
              <li className="my-4">
                <div className="border-t border-blue-500/20"></div>
              </li>

              {/* Add Section */}
              {menuItems.addItems.length > 0 && (
                <>
                  <MenuItem
                    icon={<FaUserPlus size={18} />}
                    label="Adicionar"
                    onClick={() => setAddDropdownOpen(!addDropdownOpen)}
                    isDropdown={true}
                    openDropdown={addDropdownOpen}
                  />

                  <AnimatePresence>
                    {addDropdownOpen && (
                      <motion.ul
                        variants={dropdownVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="ml-4 mt-1 border-l border-blue-500/20 pl-3 overflow-hidden"
                      >
                        {menuItems.addItems.map((item, index) => (
                          <MenuItem
                            key={`add-${index}`}
                            to={item.to}
                            icon={item.icon}
                            label={item.label}
                          />
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* List Section */}
              {menuItems.listItems.length > 0 && (
                <>
                  <MenuItem
                    icon={<FaListAlt size={18} />}
                    label="Listagens"
                    onClick={() => setListDropdownOpen(!listDropdownOpen)}
                    isDropdown={true}
                    openDropdown={listDropdownOpen}
                  />

                  <AnimatePresence>
                    {listDropdownOpen && (
                      <motion.ul
                        variants={dropdownVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="ml-4 mt-1 border-l border-blue-500/20 pl-3 overflow-hidden"
                      >
                        {menuItems.listItems.map((item, index) => (
                          <MenuItem
                            key={`list-${index}`}
                            to={item.to}
                            icon={item.icon}
                            label={item.label}
                          />
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* Divider */}
              <li className="my-4">
                <div className="border-t border-blue-500/20"></div>
              </li>

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
          <div className="p-4 mt-auto text-center text-xs text-blue-300/70 border-t border-blue-500/20 bg-gray-950/30 backdrop-blur-md">
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-semibold">
              &copy; {new Date().getFullYear()} CRM Premium
            </div>
            <div className="mt-1 text-blue-400/50">
              Sistema de Gestão Imobiliária
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;