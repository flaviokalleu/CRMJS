import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaBed, FaBath, FaWhatsapp } from "react-icons/fa";
import Slider from "react-slick";

// Componente Modal
const Modal = ({
  isOpen,
  onClose,
  currentImage,
  setCurrentImage,
  imageList,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="relative max-w-full max-h-full flex items-center justify-center">
        <img
          src={currentImage}
          alt="Imagem ampliada"
          className="max-w-full max-h-full rounded-lg"
        />
        <button
          className="absolute top-2 right-2 text-white text-xl focus:outline-none"
          onClick={onClose}
          aria-label="Fechar"
        >
          ✖
        </button>
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button
            className="bg-gray-800 text-white p-2 m-2 rounded"
            onClick={() =>
              setCurrentImage((prev) =>
                prev > 0 ? prev - 1 : imageList.length - 1
              )
            }
            aria-label="Imagem anterior"
          >
            ◀
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            className="bg-gray-800 text-white p-2 m-2 rounded"
            onClick={() =>
              setCurrentImage((prev) =>
                prev < imageList.length - 1 ? prev + 1 : 0
              )
            }
            aria-label="Próxima imagem"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Principal ImovelDetail
const ImovelDetail = () => {
  const { id } = useParams();
  const [imovel, setImovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imoveisSemelhantes, setImoveisSemelhantes] = useState([]);

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

        const imagesString = data.data.imagens;
        const images =
          typeof imagesString === "string"
            ? JSON.parse(imagesString.replace(/&quot;/g, '"'))
            : Array.isArray(imagesString)
            ? imagesString
            : [];

        setImageList(
          images.map(
            (img) =>
              `${process.env.REACT_APP_API_URL}/${img.replace(/\\/g, "/")}`
          )
        );

        // Fetch de imóveis semelhantes pela localização
        const responseSemelhantes = await fetch(
          `${process.env.REACT_APP_API_URL}/imoveis/${id}/semelhantes`
        );

        if (!responseSemelhantes.ok) {
          throw new Error("Imóveis semelhantes não encontrados.");
        }

        const semelhantesData = await responseSemelhantes.json();
        setImoveisSemelhantes(semelhantesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchImovel();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-4">Carregando...</div>;
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
    localizacao = "Localização não informada",
  } = imovel || {};

  const imageUrl = imagem_capa
    ? `${process.env.REACT_APP_API_URL}/${imagem_capa}`
    : "https://via.placeholder.com/600";

  const whatsappMessage = `Olá! Estou interessado no imóvel "${nome_imovel}" que encontrei. Veja mais em: ${window.location.href}`;
  const whatsappLink = `https://api.whatsapp.com/send/?phone=${
    process.env.REACT_APP_WHATSAPP_NUMBER
  }&text=${encodeURIComponent(whatsappMessage)}`;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: window.innerWidth < 768 ? 1 : 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "20px",
    beforeChange: (current, next) => setCurrentImageIndex(next),
    swipeToSlide: true,
  };

  const settingsSemelhantes = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: window.innerWidth < 768 ? 1 : 4,
    slidesToScroll: 1,
    swipeToSlide: true,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="container mx-auto py-8 px-4 flex flex-col md:flex-row">
        <div className="md:w-2/3 flex flex-col">
          <img
            alt={nome_imovel}
            className="max-w-full h-auto object-cover rounded-lg cursor-pointer transition-transform transform hover:scale-105"
            src={imageList[currentImageIndex] || imageUrl}
            onClick={() => setIsModalOpen(true)}
          />
          <div className="mt-4">
            <Slider {...settings}>
              {imageList.map((img, index) => (
                <div key={index} className="px-2">
                  <img
                    src={img}
                    alt={`Imagem - ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg cursor-pointer transition-transform transform hover:scale-105"
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setIsModalOpen(true);
                    }}
                  />
                </div>
              ))}
            </Slider>
          </div>
        </div>

        <div className="md:w-1/3 bg-white shadow-lg rounded-lg p-6 mt-6 md:mt-0">
          <h2 className="text-3xl font-semibold text-gray-800">
            {nome_imovel}
          </h2>
          <h3 className="text-2xl text-blue-600 mt-2">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(valor_venda)}
          </h3>
          <p className="text-gray-700 mt-4">{descricao_imovel}</p>
          <div className="my-4 flex items-center">
            <FaBed className="text-gray-500 mr-2" />
            <span>{quartos} Quartos</span>
          </div>
          <div className="my-4 flex items-center">
            <FaBath className="text-gray-500 mr-2" />
            <span>{banheiro} Banheiros</span>
          </div>
          <div className="my-4">
            <p className="text-gray-600">Localização: {localizacao}</p>
          </div>
          {process.env.REACT_APP_WHATSAPP_NUMBER ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block bg-green-500 text-white px-5 py-3 rounded-lg hover:bg-green-600 transition"
            >
              <FaWhatsapp className="inline mr-2" /> Enviar Mensagem no WhatsApp
            </a>
          ) : (
            <p className="mt-4 text-red-600">O WhatsApp não está disponível.</p>
          )}
        </div>
      </div>

      {/* Modal para a imagem ampliada */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentImage={imageList[currentImageIndex]}
        setCurrentImage={setCurrentImageIndex}
        imageList={imageList}
      />

      <div className="container mx-auto mt-8">
        <h2 className="text-2xl font-semibold text-gray-800">
          Imóveis Semelhantes
        </h2>
        <Slider {...settingsSemelhantes}>
          {imoveisSemelhantes.map((imovel) => (
            <div key={imovel.id} className="px-2">
              <Link to={`/imovel/${imovel.id}`}>
                <img
                  src={`${process.env.REACT_APP_API_URL}/${imovel.imagem_capa}`}
                  alt={imovel.nome_imovel}
                  className="w-full h-48 object-cover rounded-lg cursor-pointer transition-transform transform hover:scale-105"
                />
                <h3 className="mt-2 text-xl font-medium text-gray-800">
                  {imovel.nome_imovel}
                </h3>
                <p className="text-blue-600">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(imovel.valor_venda)}
                </p>
              </Link>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default ImovelDetail;
