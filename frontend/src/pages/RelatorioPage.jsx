import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";

const RelatorioPage = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGerarRelatorio = async () => {
    setLoading(true);
    setPdfUrl(null);

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
        setPdfUrl(url);
      } else {
        throw new Error("Erro ao gerar o relatório");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Ocorreu um erro ao gerar o relatório. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black p-6">
        <h1 className="text-4xl font-extrabold text-center text-white mb-8 tracking-tight drop-shadow-lg">
          Gerar Relatório PDF
        </h1>

        <button
          onClick={handleGerarRelatorio}
          disabled={loading}
          className={`w-full md:w-1/2 py-3 rounded-lg font-bold text-lg shadow-lg transition-all duration-200 ${
            loading
              ? "bg-blue-700/60 opacity-60 cursor-not-allowed text-white"
              : "bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white"
          }`}
        >
          {loading ? "Gerando Relatório..." : "Exibir Relatório PDF"}
        </button>

        {loading && (
          <div className="mt-8 flex flex-col items-center">
            <div className="border-t-4 border-blue-600 border-solid rounded-full w-12 h-12 animate-spin mb-4"></div>
            <p className="text-white text-lg">
              Carregando relatório, por favor aguarde...
            </p>
          </div>
        )}

        {pdfUrl && !loading && (
          <div className="mt-10 w-full flex flex-col items-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Relatório Gerado:
            </h2>
            <div className="w-full max-w-3xl h-[70vh] bg-blue-950 border border-blue-900/40 rounded-xl shadow-xl overflow-hidden mb-6">
              <iframe
                src={pdfUrl}
                title="Relatório PDF"
                className="w-full h-full"
                frameBorder="0"
              />
            </div>
            <a
              href={pdfUrl}
              download="relatorio.pdf"
              className="inline-block bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-300"
            >
              Baixar Relatório
            </a>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RelatorioPage;
