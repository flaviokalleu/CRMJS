import React from "react";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 py-8">
      <div className="max-w-screen-xl mx-auto text-center text-white">
        <p className="mb-6 text-sm">
          © 2024 Webba Company. Todos os direitos reservados.
        </p>
        <div className="flex justify-center space-x-6 mb-4">
          <a
            href="https://www.instagram.com/seuusuario"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-green-500 transition duration-300 text-lg flex items-center"
          >
            <FaInstagram className="mr-2" /> Instagram
          </a>
          <a
            href="https://www.facebook.com/seuusuario"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-green-500 transition duration-300 text-lg flex items-center"
          >
            <FaFacebookF className="mr-2" /> Facebook
          </a>
          
        </div>
        <div className="border-t border-gray-700 pt-4">
          <p className="text-xs text-gray-400">
            Siga-nos nas redes sociais para ficar por dentro das novidades!
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
