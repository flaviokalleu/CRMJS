import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ImovelDetail = () => {
  const { id } = useParams();
  const [imovel, setImovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchImovel = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/imoveis/${id}`
        );

        if (!response.ok) {
          throw new Error("Imóvel não encontrado.");
        }

        const data = await response.json();
        setImovel(data.data);
        const images = data.data.imagens || [];
        setImageList(
          images.map((img) => `${process.env.REACT_APP_API_URL}/${img}`)
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchImovel();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="py-4 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const {
    nome_imovel = "Nome não disponível",
    valor_venda = 0,
    imagem_capa,
    descricao_imovel = "Descrição não disponível.",
    quartos = "N/A",
    banheiro = "N/A",
  } = imovel || {};

  const imageUrl = imagem_capa
    ? `${process.env.REACT_APP_API_URL}/${imagem_capa}`
    : "https://via.placeholder.com/600";

  const whatsappMessage = `Olá! Estou interessado no imóvel "${nome_imovel}" que encontrei. Veja mais em: ${window.location.href}`;
  const whatsappLink = `https://api.whatsapp.com/send/?phone=${
    process.env.REACT_APP_WHATSAPP_NUMBER
  }&text=${encodeURIComponent(whatsappMessage)}`;

  const handleOpen = (index) => {
    setCurrentImageIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === imageList.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? imageList.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="py-4 bg-gray-100">
      <div className="container mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <img
            alt={nome_imovel}
            className="w-full h-96 object-cover cursor-pointer transition-transform transform hover:scale-105"
            src={imageUrl}
            onClick={() => handleOpen(0)}
          />
          <div className="p-4">
            <h2 className="text-gray-800 text-2xl font-bold">{nome_imovel}</h2>
            <h3 className="text-blue-600 text-xl">
              R${valor_venda.toFixed(2)}
            </h3>
            <p className="text-gray-700">{descricao_imovel}</p>
            <div className="my-2">
              <span className="inline-flex items-center px-2 py-1 text-sm font-semibold text-gray-700 border border-gray-300 rounded">
                Quartos: {quartos}
              </span>
              <span className="inline-flex items-center px-2 py-1 text-sm font-semibold text-gray-700 border border-gray-300 rounded">
                Banheiros: {banheiro}
              </span>
            </div>
            <div className="mt-4">
              {process.env.REACT_APP_WHATSAPP_NUMBER ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  Enviar Mensagem no WhatsApp
                </a>
              ) : (
                <p className="text-red-600">O WhatsApp não está disponível.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-gray-800 text-2xl font-bold">
            Imagens do Imóvel
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imageList.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Imóvel - ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg cursor-pointer transition-transform transform hover:scale-105"
                onClick={() => handleOpen(index)}
              />
            ))}
          </div>
        </div>

        {open && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
            <div className="bg-white rounded-lg p-4 relative max-w-3xl w-full mx-4">
              <button onClick={handleClose} className="absolute top-2 right-2">
                <span className="text-red-600 text-3xl">&times;</span>
              </button>
              <div className="flex flex-col sm:flex-row items-center justify-center">
                <button
                  onClick={handlePrev}
                  className="p-3 text-blue-600 text-2xl hover:text-blue-800"
                >
                  &lt;
                </button>
                <img
                  src={imageList[currentImageIndex]}
                  alt={`Imagem Ampliada ${currentImageIndex + 1}`}
                  className="max-w-full max-h-[80vh] object-contain mx-4 my-4"
                />
                <button
                  onClick={handleNext}
                  className="p-3 text-blue-600 text-2xl hover:text-blue-800"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImovelDetail;
