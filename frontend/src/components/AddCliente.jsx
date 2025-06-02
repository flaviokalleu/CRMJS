// src/pages/AddCliente.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ClientForm from './ClientForm';

const AddCliente = () => {
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const handleSuccess = () => {
        setOpenSnackbar(true);
        setTimeout(() => setOpenSnackbar(false), 3000); // Auto hide after 3s
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black py-8 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-blue-100">
                        Adicionar Cliente
                    </h1>
                    <p className="mt-2 text-blue-400/80">
                        Preencha os dados do novo cliente
                    </p>
                </div>

                {/* Form Container */}
                <div className="bg-blue-900/30 backdrop-blur-md rounded-2xl p-8 border border-blue-800/40 shadow-lg">
                    <ClientForm onSuccess={handleSuccess} />
                </div>
            </motion.div>

            {/* Success Notification */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: openSnackbar ? 1 : 0, y: openSnackbar ? 0 : 50 }}
                className={`fixed bottom-4 right-4 z-50 ${!openSnackbar && 'pointer-events-none'}`}
            >
                <div className="bg-blue-900/90 backdrop-blur-md text-blue-100 px-6 py-4 rounded-xl border border-blue-700/50 shadow-lg flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p>Cliente adicionado com sucesso!</p>
                    <button 
                        onClick={handleCloseSnackbar}
                        className="ml-4 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        ×
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AddCliente;
