import React from "react";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-blue-950 via-blue-900 to-black py-10">
      <div className="max-w-screen-xl mx-auto text-center text-white px-4">
        <div className="mb-6">
          <img
            src="/logo.png"
            alt="Parnassá Imobiliária"
            className="mx-auto h-14 mb-4"
            loading="lazy"
          />
          <p className="text-sm text-blue-100">
            © 2024 Parnassá Imobiliária. Todos os direitos reservados.
          </p>
        </div>
        <div className="flex justify-center space-x-8 mb-6">
          <a
            href="https://www.instagram.com/seuusuario"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-green-500 transition duration-300 text-2xl"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="https://www.facebook.com/seuusuario"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-green-500 transition duration-300 text-2xl"
            aria-label="Facebook"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://www.linkedin.com/in/seuusuario"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-green-500 transition duration-300 text-2xl"
            aria-label="LinkedIn"
          >
            <FaLinkedinIn />
          </a>
          <a
            href="https://twitter.com/seuusuario"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-green-500 transition duration-300 text-2xl"
            aria-label="Twitter"
          >
            <FaTwitter />
          </a>
        </div>
        <div className="border-t border-blue-900/40 pt-4">
          <p className="text-xs text-blue-200">
            Siga-nos nas redes sociais para ficar por dentro das novidades!
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
