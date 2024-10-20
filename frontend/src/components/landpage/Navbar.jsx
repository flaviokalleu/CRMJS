import React, { useState, useEffect } from "react";
import { FaSearch, FaWhatsapp, FaSignInAlt, FaUser } from "react-icons/fa";
import { motion } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSubmenu, setShowSubmenu] = useState(true);
  const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER;

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleScroll = () => {
    setShowSubmenu(window.scrollY === 0);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const submenuLinks = [
    { href: "/", label: "Inicio" },
    { href: "/imoveis?categoria=novo", label: "Imóveis Novos" },

    { href: "/imoveis?categoria=usados", label: "Imóveis Usados" },
    //{ href: "/imoveis?categoria=agio", label: "Ágio" },
    {
      href: "/imoveis?localizacao=Valparaiso de Goiás - Goiás",
      label: "Valparaíso de Goiás",
    },
    {
      href: "/imoveis?localizacao=cidade-ocidental",
      label: "Cidade Ocidental",
    },
    { href: "/imoveis?localizacao=luziania", label: "Luziania" },
    { href: "/imoveis?localizacao=Jardim Inga - Goias", label: "Jardim Ingá" },
    { href: "/imoveis?localizacao=brasilia", label: "Brasília" },
    { href: "/imoveis", label: "Todos os Imoveis" },
  ];

  return (
    <>
      <div className="bg-[#78b439] text-white text-center py-2 fixed w-full z-20 top-0">
        <p className="text-sm font-semibold">
          Bem-vindo ao nosso site! Aproveite nossas ofertas especiais.
        </p>
      </div>
      {/* Navbar Desktop */}
      <nav className="hidden md:block bg-white fixed w-full z-20 top-8 mb-8 border-t border-gray-300 shadow-md">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <img src="/logo.png" className="h-12 filter invert" alt="Logo" />
          </a>
          <div className="flex-grow mx-8">
            <form
              id="frmBusca"
              role="search"
              method="GET"
              action="/busca/"
              className="w-full"
            >
              <div className="relative">
                <input
                  type="text"
                  id="buscaTopo"
                  name="busca"
                  placeholder="O que você procura?"
                  className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#78b439]"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#78b439] hover:text-green-700"
                >
                  <FaSearch />
                </button>
              </div>
            </form>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-sm text-gray-800"></div>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              className="bg-[#78b439] text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-[#78b439] flex items-center space-x-2"
            >
              <FaWhatsapp />
              <span>Dúvidas? Chama no WhatsApp!</span>
            </a>
            <a
              href="/login"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 flex items-center space-x-2"
            >
              <FaSignInAlt />
              <span>Corretores</span>
            </a>
          </div>
        </div>
        {showSubmenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-300 mb-1 bg-white"
          >
            <div className="flex justify-center items-center w-full">
              <ul className="flex space-x-4 m-0 p-0">
                {submenuLinks.map(({ href, label }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="block px-4 py-2 hover:text-[#78b439]"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Navbar Mobile */}
      <nav className="md:hidden bg-white fixed w-full z-20 top-8 border-t border-gray-300 shadow-md">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a
            href="#"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <img src="/logo.png" className="h-12 filter invert" alt="Logo" />
          </a>
          <button
            onClick={toggleMenu}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-gray-400 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-controls="navbar-sticky"
            aria-expanded={isOpen}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
        {isOpen && (
          <div className="bg-white flex flex-col items-center p-4 border-t border-gray-300">
            <form
              id="frmBusca"
              role="search"
              method="GET"
              action="/busca/"
              className="w-full p-4"
            >
              <div className="relative">
                <input
                  type="text"
                  id="buscaTopo"
                  name="busca"
                  placeholder="O que você procura?"
                  className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#78b439]"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#78b439] hover:text-green-700"
                >
                  <FaSearch />
                </button>
              </div>
            </form>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              className="my-4 bg-[#78b439] text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-[#78b439] flex items-center space-x-2"
            >
              <FaWhatsapp />
              <span>Dúvidas? Chama no WhatsApp!</span>
            </a>
            <a
              href="/login"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 flex items-center space-x-2"
            >
              <FaSignInAlt />
              <span>Login</span>
            </a>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
