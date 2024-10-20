import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/';

const AddCorretor = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [photo, setPhoto] = useState(null);
    const [creci, setCreci] = useState('');
    const [address, setAddress] = useState('');
    const [pixAccount, setPixAccount] = useState('');
    const [telefone, setTelefone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        if (photo) formData.append('photo', photo);
        if (creci) formData.append('creci', creci);
        if (address) formData.append('address', address);
        if (pixAccount) formData.append('pix_account', pixAccount);
        formData.append('telefone', telefone);
        formData.append('password', password);

        try {
            const response = await axios.post(`${API_URL}/corretor`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Corretor adicionado com sucesso:', response.data);
            setSuccessMessage('Corretor adicionado com sucesso!');
            setUsername('');
            setEmail('');
            setFirstName('');
            setLastName('');
            setPhoto(null);
            setCreci('');
            setAddress('');
            setPixAccount('');
            setTelefone('');
            setPassword('');
        } catch (error) {
            console.error('Erro ao adicionar corretor:', error);
            setErrorMessage('Erro ao adicionar corretor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen">
            
            <div className="container mx-auto p-8 mt-8 bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-3xl text-white mb-6">Adicionar Corretor</h1>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-white mb-2">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-white mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-white mb-2">Nome</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-white mb-2">Sobrenome</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-white mb-2">Foto</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPhoto(e.target.files[0])}
                                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-white mb-2">CRECI</label>
                            <input
                                type="text"
                                value={creci}
                                onChange={(e) => setCreci(e.target.value)}
                                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-white mb-2">Endereço</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-white mb-2">PIX/Conta</label>
                            <input
                                type="text"
                                value={pixAccount}
                                onChange={(e) => setPixAccount(e.target.value)}
                                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-white mb-2">Telefone</label>
                            <input
                                type="text"
                                value={telefone}
                                onChange={(e) => setTelefone(e.target.value)}
                                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-white mb-2">Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
                            />
                        </div>
                        <div className="col-span-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full p-3 text-white rounded-lg ${loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
                            >
                                {loading ? 'Carregando...' : 'Adicionar Corretor'}
                            </button>
                        </div>
                    </div>
                </form>
                {successMessage && (
                    <div className="mt-4 p-4 bg-green-600 text-white rounded-lg">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="mt-4 p-4 bg-red-600 text-white rounded-lg">
                        {errorMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddCorretor;
