import React, { useState, useEffect } from "react";
import axios from "axios"; // Importando o axios
import ListaImoveisPublico from "../components/ListaImoveisPublico";
import Navbar from "../components/landpage/Navbar";
import Footer from "../components/landpage/Footer"; // Ajuste o caminho conforme necessário
import Filtro from "../components/Filtro"; // Importando o Filtro
import { useLocation } from "react-router-dom"; // Importando hook para acessar parâmetros da URL

const PublicImoveisPage = () => {
  const [imoveis, setImoveis] = useState([]); // Estado para os imóveis
  const [error, setError] = useState(null); // Estado para erro
  const [loading, setLoading] = useState(true); // Estado para loading
  const [filters, setFilters] = useState({
    tipo: "",
    valorMin: "",
    valorMax: "",
    localizacao: "",
    tags: [], // Se você estiver usando tags, inicialize aqui
  });

  const location = useLocation(); // Hook para acessar a localização atual

  // Função para obter os parâmetros de consulta da URL
  const getQueryParams = () => {
    const params = new URLSearchParams(location.search);
    return {
      tipo: params.get("tipo") || "",
      valorMin: params.get("valorMin") || "",
      valorMax: params.get("valorMax") || "",
      localizacao: params.get("localizacao") || "",
      tags: params.get("tags") ? params.get("tags").split(",") : [],
    };
  };

  useEffect(() => {
    const initialFilters = getQueryParams(); // Obtém filtros iniciais da URL
    setFilters((prevFilters) => ({ ...prevFilters, ...initialFilters }));
  }, [location.search]); // Re-executa quando a localização muda

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSelect = (filter) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...filter,
    }));
  };

  useEffect(() => {
    const fetchImoveis = async () => {
      setLoading(true); // Define loading como true antes da requisição
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/imoveis?${new URLSearchParams(
            filters
          ).toString()}`
        );
        setImoveis(response.data);
      } catch (err) {
        setError("Erro ao carregar imóveis");
      } finally {
        setLoading(false); // Define loading como false após a requisição
      }
    };

    fetchImoveis();
  }, [filters]); // Re-executa quando os filtros mudam

  return (
    <div className="public-imoveis-page">
      <Navbar
        className="fixed top-0 left-0 right-0 z-10"
        onFilterSelect={handleFilterSelect} // Passando a função corretamente
      />
      <div className="mt-24 pt-32 mb-24">
        {" "}
        {/* Adicionada margem inferior aqui */}
        <Filtro
          filters={filters}
          handleFilterChange={handleFilterChange}
          className="mb-6" // Espaçamento abaixo do filtro
        />
        {loading && <p>Carregando imóveis...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <ListaImoveisPublico filters={filters} />
      </div>
      <Footer className="pt-24" /> {/* Mantido para espaçamento interno */}
    </div>
  );
};

export default PublicImoveisPage;
