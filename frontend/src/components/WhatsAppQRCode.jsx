import React, { useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DisconnectIcon from "@mui/icons-material/PowerSettingsNew";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";

const WhatsAppQRCode = () => {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === "authenticated") {
        setSuccessMessage("Você está conectado com sucesso!");
        setIsConnected(true);
        setQrCode(""); // Clear QR Code after authentication
      } else if (data.status === "disconnected") {
        setSuccessMessage("Você foi desconectado.");
        setIsConnected(false);
      }
    };

    const fetchQRCode = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/qr-code`
        );
        if (response.ok) {
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          setQrCode(imageUrl);
          setLoading(false);
        } else {
          console.error("Erro ao obter QR Code:", response.statusText);
        }
      } catch (error) {
        console.error("Erro ao buscar QR Code:", error.message);
      }
    };

    const checkAuthenticationStatus = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/status`);
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            setSuccessMessage("Você está autenticado com sucesso!");
            setIsConnected(true);
          } else {
            setIsConnected(false);
          }
        }
      } catch (error) {
        console.error(
          "Erro ao verificar o status de autenticação:",
          error.message
        );
      }
    };

    const checkStatusContinuously = async () => {
      await fetchQRCode();
      await checkAuthenticationStatus();
      setTimeout(checkStatusContinuously, 10000); // Call again after 10 seconds
    };

    checkStatusContinuously();

    return () => {
      socket.close();
    };
  }, []);

  const handleQRCodeScanned = () => {
    setSuccessMessage("QR Code escaneado com sucesso!");
    setIsConnected(true);
  };

  const handleDisconnect = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/disconnect`, {
        method: "POST",
      });
      setIsConnected(false);
      setQrCode("");
      setSuccessMessage("Desconectado com sucesso.");
    } catch (error) {
      console.error("Erro ao desconectar:", error.message);
    }
  };

  const renderConfetti = () => {
    return (
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="confetti" />
        <div className="confetti" />
        <div className="confetti" />
        <div className="confetti" />
        <div className="confetti" />
      </div>
    );
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      {isConnected && renderConfetti()}
      <h2 className="text-4xl font-bold mb-4 animate-bounce">
        Escanear QR Code
      </h2>
      {loading ? (
        <CircularProgress className="text-white" />
      ) : isConnected ? (
        <div className="flex flex-col items-center text-center">
          <CheckCircleIcon className="text-green-500 text-6xl mb-4" />
          <p className="text-green-400 text-lg font-semibold mb-4">
            {successMessage}
          </p>
          <img
            src="https://res.cloudinary.com/amodelivery/image/upload/v1580151660/Blog/ezgif-3-360f65df4d8d.gif" // Replace with your meme image URL
            alt="Meme"
            className="w-64 h-auto mb-4 rounded shadow-lg"
          />
          <Button
            onClick={handleDisconnect}
            variant="contained"
            color="error"
            startIcon={<DisconnectIcon />}
            className="mt-4 shadow-lg"
          >
            Desconectar
          </Button>
        </div>
      ) : qrCode ? (
        <div className="flex flex-col items-center">
          <img
            src={qrCode}
            alt="QR Code"
            className="w-64 h-64 mb-4 border border-gray-700 rounded"
          />
          <Button
            onClick={handleQRCodeScanned}
            variant="contained"
            color="success"
            startIcon={<EmojiEmotionsIcon />}
            className="mt-4"
          >
            QR Code Escaneado
          </Button>
        </div>
      ) : (
        <p className="text-xl">Não conectado. Escaneie o QR Code.</p>
      )}
    </div>
  );
};

export default WhatsAppQRCode;
