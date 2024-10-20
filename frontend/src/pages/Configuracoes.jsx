// src/pages/Configuracoes.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout"; // Certifique-se de que o layout está correto
import { useAuth } from "../context/AuthContext"; // Importa o contexto de autenticação

const Configuracoes = () => {
  const { user } = useAuth(); // Obtém as informações do usuário do contexto de autenticação
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null); // Estado para armazenar o arquivo selecionado
  const [password, setPassword] = useState(""); // Estado para armazenar a nova senha
  const [showPopup, setShowPopup] = useState(false); // Estado para controlar a exibição do popup
  const [message, setMessage] = useState(""); // Estado para armazenar a mensagem do popup

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) {
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/users/${user.email}`
        );
        setUserInfo(response.data);
      } catch (error) {
        console.error("Erro ao buscar informações do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [user]);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("first_name", userInfo.first_name);
      formData.append("last_name", userInfo.last_name);
      formData.append("email", userInfo.email);
      formData.append("telefone", userInfo.telefone);
      formData.append("creci", userInfo.creci);
      formData.append("address", userInfo.address);
      formData.append("pix_account", userInfo.pix_account);

      // Adiciona a nova senha ao formData se estiver preenchida
      if (password) {
        formData.append("password", password);
      }

      // Adiciona o arquivo ao formData se houver um arquivo selecionado
      if (selectedFile) {
        formData.append("photo", selectedFile);
      }

      await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/users/${user.email}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Configurações atualizadas com sucesso!");
      setShowPopup(true);
    } catch (error) {
      console.error("Erro ao atualizar informações do usuário:", error);
      setMessage("Erro ao atualizar configurações.");
      setShowPopup(true);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  if (loading) {
    return <div className="text-white">Carregando configurações...</div>;
  }

  if (!userInfo) {
    return <div className="text-white">Informações do usuário não encontradas.</div>;
  }

  return (
    <MainLayout>
      <div className="p-6 bg-gray-900 text-white min-h-screen">
        <h1 className="text-4xl font-bold mb-8">Configurações do Usuário</h1>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="space-y-6">
            {[
              { label: "Nome", value: userInfo.first_name, key: "first_name" },
              { label: "Sobrenome", value: userInfo.last_name, key: "last_name" },
              { label: "Email", value: userInfo.email, key: "email", type: "email" },
              { label: "Telefone", value: userInfo.telefone, key: "telefone" },
              { label: "CRECI", value: userInfo.creci, key: "creci" },
              { label: "Endereço", value: userInfo.address, key: "address" },
              { label: "Conta PIX", value: userInfo.pix_account, key: "pix_account" }
            ].map(({ label, value, key, type = "text" }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}:</label>
                <input
                  type={type}
                  value={value || ""}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, [key]: e.target.value })
                  }
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
                  placeholder={`Digite seu ${label.toLowerCase()}`}
                />
              </div>
            ))}

            {/* Campo para Nova Senha */}
            <div>
              <label className="block text-sm font-medium mb-1">Nova Senha:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
                placeholder="Digite sua nova senha"
              />
            </div>

            {/* Campo para Foto de Perfil */}
            <div>
              <label className="block text-sm font-medium mb-1">Foto:</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            className="mt-6 w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Salvar
          </button>
        </div>

        {/* Popup de Confirmação */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">{message}</h2>
              <button
                onClick={() => setShowPopup(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Configuracoes;
