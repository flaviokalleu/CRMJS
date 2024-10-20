import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const ModalEditarCliente = ({ cliente, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    valorRenda: "",
    estadoCivil: "",
    naturalidade: "",
    profissao: "",
    dataAdmissao: "",
    dataNascimento: "",
    rendaTipo: "",
    possuiCarteiraMaisTresAnos: false,
    numeroPis: "",
    possuiDependente: false,
    status: "",
    created_at: "", // Adicione created_at aqui
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (cliente && cliente.id) {
      setFormData({
        nome: cliente.nome || "",
        email: cliente.email || "",
        telefone: cliente.telefone || "",
        cpf: cliente.cpf || "",
        valorRenda: cliente.valor_renda || "",
        estadoCivil: cliente.estado_civil || "",
        naturalidade: cliente.naturalidade || "",
        profissao: cliente.profissao || "",
        dataAdmissao: cliente.data_admissao?.split("T")[0] || "",
        dataNascimento: cliente.data_nascimento?.split("T")[0] || "",
        rendaTipo: cliente.renda_tipo || "",
        possuiCarteiraMaisTresAnos:
          cliente.possui_carteira_mais_tres_anos || false,
        numeroPis: cliente.numero_pis || "",
        possuiDependente: cliente.possui_dependente || false,
        status: cliente.status || "",
        created_at: cliente.created_at || "", // Preencha created_at se existir
      });
    }
  }, [cliente]);

  const handleInputChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field) => (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ...files],
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setMessage("Token de autenticação não encontrado.");
      return;
    }

    if (!cliente || !cliente.id) {
      setMessage("Cliente não está definido ou não possui ID.");
      return;
    }

    setLoading(true);
    const {
      created_at = "", // Incluindo created_at
      ...rest
    } = formData;

    const formDataToSubmit = new FormData();
    Object.entries(rest).forEach(([key, value]) => {
      formDataToSubmit.append(key, value);
    });

    // Adicionando arquivos ao FormData
    const fileFields = [
      "documentos_pessoais",
      "extrato_bancario",
      "documentos_dependente",
      "documentos_conjuge",
    ];

    fileFields.forEach((field) => {
      const files = formData[field] || []; // Obtendo arquivos do estado
      files.forEach((file) => {
        formDataToSubmit.append(field, file);
      });
    });

    try {
      const response = await axios.put(
        `${API_URL}/clientes/${cliente.id}`,
        formDataToSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Passa o cliente atualizado para o handler
      onSave({
        ...rest,
        id: cliente.id,
        created_at: formData.created_at || "", // Inclua created_at na atualização
      });

      setMessage("Cliente atualizado com sucesso!");
    } catch (error) {
      setMessage("Erro ao atualizar cliente.");
      console.error(
        "Erro ao atualizar cliente:",
        error.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg max-w-4xl w-full overflow-auto">
        <h2 className="text-2xl font-bold mb-4">Editar Cliente</h2>
        {message && <p className="text-red-500">{message}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key}>
              {key === "created_at" ? (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Criado Em:
                  </label>
                  <input
                    type="date"
                    value={value} // Usar o valor diretamente
                    onChange={(e) => handleInputChange(key)(e.target.value)}
                    className="border border-gray-700 bg-gray-800 p-2 rounded w-full text-white"
                  />
                </div>
              ) : typeof value === "boolean" ? (
                <div className="col-span-2 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleInputChange(key)(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-500"
                  />
                  <label className="text-sm">
                    {key.replace(/_/g, " ").replace(/([A-Z])/g, " $1")}
                  </label>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {key.replace(/_/g, " ").replace(/([A-Z])/g, " $1")}:
                  </label>
                  <input
                    type={
                      key.includes("data")
                        ? "date"
                        : typeof value === "number"
                        ? "number"
                        : "text"
                    }
                    value={value}
                    onChange={(e) => handleInputChange(key)(e.target.value)}
                    className="border border-gray-700 bg-gray-800 p-2 rounded w-full text-white"
                  />
                </div>
              )}
            </div>
          ))}

          {/* Campos de upload de arquivos */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">
              Documentos Pessoais:
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange("documentos_pessoais")}
              className="border border-gray-700 bg-gray-800 p-2 rounded w-full text-white"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">
              Extrato Bancário:
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange("extrato_bancario")}
              className="border border-gray-700 bg-gray-800 p-2 rounded w-full text-white"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">
              Documentos Dependente:
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange("documentos_dependente")}
              className="border border-gray-700 bg-gray-800 p-2 rounded w-full text-white"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">
              Documentos Cônjuge:
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange("documentos_conjuge")}
              className="border border-gray-700 bg-gray-800 p-2 rounded w-full text-white"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarCliente;
