// src/components/LoadingScreen.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Typography } from '@mui/material';

const LoadingScreen = ({ onComplete }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulação de carregamento
    const timer = setTimeout(() => {
      setLoading(false);
      onComplete();
    }, 3000); // Tempo de carregamento (3000 ms = 3 segundos)

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: loading ? 1 : 0 }}
      transition={{ duration: 5 }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8">
        <div className="relative w-full max-w-md">
          <div className="bg-gray-800 rounded-full h-2 w-full overflow-hidden">
            <motion.div
              className="bg-blue-600 h-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'linear' }} // Ajuste o tempo de carregamento aqui
            />
          </div>
          <Typography
            variant="h6"
            className="text-white text-center mt-4"
          >
            Aguarde Estamos Carregando as informações...
          </Typography>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
