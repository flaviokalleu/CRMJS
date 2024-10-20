// src/pages/AddCliente.js
import React, { useState } from 'react';

import ClientForm from './ClientForm';

const AddCliente = () => {
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const handleSuccess = () => {
        setOpenSnackbar(true);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <div className="bg-gray-900 min-h-screen p-8">
           
            <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-white mb-6">Adicionar Cliente</h1>
                <ClientForm onSuccess={handleSuccess} />
            </div>
            {openSnackbar && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
                    <p>Cliente adicionado com sucesso!</p>
                    <button onClick={handleCloseSnackbar} className="ml-4 text-lg font-bold">×</button>
                </div>
            )}
        </div>
    );
};

export default AddCliente;
