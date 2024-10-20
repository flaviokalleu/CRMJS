import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout"; // Certifique-se de que o caminho está correto

const RelatorioPage = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false); // Estado para controlar o carregamento

  const handleGerarRelatorio = async () => {
    setLoading(true); // Inicia o carregamento

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/relatorio`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/pdf",
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url); // Define o URL do PDF para exibir no iframe
      } else {
        throw new Error("Erro ao gerar o relatório");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Ocorreu um erro ao gerar o relatório. Tente novamente.");
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 p-6">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Gerar Relatório
        </h1>

        <button
          onClick={handleGerarRelatorio}
          className="w-full md:w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition duration-300 ease-in-out"
        >
          Exibir Relatório PDF
        </button>

        {/* Exibe a tela de carregamento enquanto o relatório está sendo gerado */}
        {loading && (
          <div className="mt-6 text-center">
            <p className="text-white">
              Carregando relatório, por favor aguarde...
            </p>
            <div className="mt-2 border-t-4 border-blue-600 border-solid rounded-full w-12 h-12 animate-spin mx-auto"></div>
          </div>
        )}

        {/* Exibe o PDF após o carregamento */}
        {pdfUrl && !loading && (
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Relatório Gerado:
            </h2>

            <div className="mt-4">
              <a
                href={pdfUrl}
                download
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out"
              >
                Baixar Relatório
              </a>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RelatorioPage;
