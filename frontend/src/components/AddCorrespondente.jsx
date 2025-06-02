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
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    if (photo) formData.append("photo", photo);
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

      setSuccessMsg("Correspondente adicionado com sucesso!");
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
      setErrorMsg("Erro ao adicionar correspondente. Verifique os dados.");
      console.error("Erro ao adicionar correspondente:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-black">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="text-white text-xl">Por favor, aguarde...</div>
        </div>
      )}
      <div
        className={`bg-blue-950/90 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-blue-900/40 ${
          loading ? "opacity-50" : ""
        }`}
      >
        <h1 className="text-3xl font-extrabold text-white mb-8 text-center tracking-tight">
          Adicionar Correspondente
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-white font-semibold mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              className="w-full p-3 rounded-lg border border-blue-800/40 bg-blue-900/60 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-700 transition"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-white font-semibold mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full p-3 rounded-lg border border-blue-800/40 bg-blue-900/60 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-700 transition"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-white font-semibold mb-1"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full p-3 rounded-lg border border-blue-800/40 bg-blue-900/60 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-700 transition"
            />
          </div>
          <div>
            <label
              htmlFor="firstName"
              className="block text-white font-semibold mb-1"
            >
              Nome
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={loading}
              className="w-full p-3 rounded-lg border border-blue-800/40 bg-blue-900/60 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-700 transition"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-white font-semibold mb-1"
            >
              Sobrenome
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={loading}
              className="w-full p-3 rounded-lg border border-blue-800/40 bg-blue-900/60 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-700 transition"
            />
          </div>
          <div>
            <label
              htmlFor="photo"
              className="block text-white font-semibold mb-1"
            >
              Foto
            </label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0])}
              disabled={loading}
              className="w-full text-white file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-600"
            />
          </div>
          <div>
            <label
              htmlFor="CRECI"
              className="block text-white font-semibold mb-1"
            >
              CRECI
            </label>
            <input
              id="CRECI"
              type="text"
              value={CRECI}
              onChange={(e) => setCRECI(e.target.value)}
              disabled={loading}
              className="w-full p-3 rounded-lg border border-blue-800/40 bg-blue-900/60 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-700 transition"
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-white font-semibold mb-1"
            >
              Endereço
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loading}
              className="w-full p-3 rounded-lg border border-blue-800/40 bg-blue-900/60 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-700 transition"
            />
          </div>
          <div>
            <label
              htmlFor="PIXConta"
              className="block text-white font-semibold mb-1"
            >
              PIX/Conta
            </label>
            <input
              id="PIXConta"
              type="text"
              value={PIXConta}
              onChange={(e) => setPIXConta(e.target.value)}
              disabled={loading}
              className="w-full p-3 rounded-lg border border-blue-800/40 bg-blue-900/60 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-700 transition"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-white font-semibold mb-1"
            >
              Telefone
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              className="w-full p-3 rounded-lg border border-blue-800/40 bg-blue-900/60 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-700 transition"
            />
          </div>
          {successMsg && (
            <div className="text-green-400 text-center font-semibold">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="text-red-400 text-center font-semibold">
              {errorMsg}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 rounded-lg font-bold text-lg shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white"
          >
            {loading ? "Adicionando..." : "Adicionar Correspondente"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCorrespondente;
