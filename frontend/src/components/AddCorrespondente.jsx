import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/";

const AddCorrespondente = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [CRECI, setCRECI] = useState("");
  const [address, setAddress] = useState("");
  const [PIXConta, setPIXConta] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false); // Estado para controlar o loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Ativar o loading

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("photo", photo);
    formData.append("CRECI", CRECI);
    formData.append("address", address);
    formData.append("PIX_Conta", PIXConta);
    formData.append("phone", phone);

    try {
      const response = await axios.post(`${API_URL}/correspondente`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Correspondente adicionado com sucesso:", response.data);

      // Limpar o formulário após a submissão
      setUsername("");
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setPhoto(null);
      setCRECI("");
      setAddress("");
      setPIXConta("");
      setPhone("");
    } catch (error) {
      console.error("Erro ao adicionar correspondente:", error);
    } finally {
      setLoading(false); // Desativar o loading
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-xl">Por favor, aguarde...</div>
        </div>
      )}
      <div
        className={`bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg ${
          loading ? "opacity-50" : ""
        }`}
      >
        <h1 className="text-2xl font-semibold text-white mb-6">
          Adicionar Correspondente
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-gray-400 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading} // Desativar durante o loading
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-400 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-400 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded"
              />
            </div>
            <div>
              <label htmlFor="firstName" className="block text-gray-400 mb-2">
                Nome
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={loading}
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-gray-400 mb-2">
                Sobrenome
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded"
              />
            </div>
            <div>
              <label htmlFor="photo" className="block text-gray-400 mb-2">
                Foto
              </label>
              <input
                id="photo"
                type="file"
                onChange={(e) => setPhoto(e.target.files[0])}
                disabled={loading}
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded"
              />
            </div>
            <div>
              <label htmlFor="CRECI" className="block text-gray-400 mb-2">
                CRECI
              </label>
              <input
                id="CRECI"
                type="text"
                value={CRECI}
                onChange={(e) => setCRECI(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-gray-400 mb-2">
                Endereço
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded"
              />
            </div>
            <div>
              <label htmlFor="PIXConta" className="block text-gray-400 mb-2">
                PIX/Conta
              </label>
              <input
                id="PIXConta"
                type="text"
                value={PIXConta}
                onChange={(e) => setPIXConta(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-gray-400 mb-2">
                Telefone
              </label>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded"
              />
            </div>
            <button
              type="submit"
              disabled={loading} // Desativar o botão durante o loading
              className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? "Adicionando..." : "Adicionar Correspondente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCorrespondente;
