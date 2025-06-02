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
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Erro ao adicionar corretor');
            setSuccessMessage('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-950 via-gray-900 to-black min-h-screen py-10">
            <div className="container mx-auto max-w-2xl p-8 bg-blue-950/80 rounded-2xl shadow-2xl border border-blue-900/40">
                <h1 className="text-3xl font-extrabold text-white mb-6 tracking-tight">Adicionar Corretor</h1>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-white font-semibold mb-2">Usuário</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full p-3 bg-blue-900/60 text-white border border-blue-800/40 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60"
                                placeholder="Digite o usuário"
                            />
                        </div>
                        <div>
                            <label className="block text-white font-semibold mb-2">E-mail</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full p-3 bg-blue-900/60 text-white border border-blue-800/40 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60"
                                placeholder="Digite o e-mail"
                            />
                        </div>
                        <div>
                            <label className="block text-white font-semibold mb-2">Nome</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="w-full p-3 bg-blue-900/60 text-white border border-blue-800/40 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60"
                                placeholder="Primeiro nome"
                            />
                        </div>
                        <div>
                            <label className="block text-white font-semibold mb-2">Sobrenome</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="w-full p-3 bg-blue-900/60 text-white border border-blue-800/40 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60"
                                placeholder="Sobrenome"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-white font-semibold mb-2">Foto</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPhoto(e.target.files[0])}
                                className="w-full p-3 bg-blue-900/60 text-white border border-blue-800/40 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-800/60 file:text-white hover:file:bg-blue-700/80"
                            />
                        </div>
                        <div>
                            <label className="block text-white font-semibold mb-2">CRECI</label>
                            <input
                                type="text"
                                value={creci}
                                onChange={(e) => setCreci(e.target.value)}
                                className="w-full p-3 bg-blue-900/60 text-white border border-blue-800/40 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60"
                                placeholder="Número do CRECI"
                            />
                        </div>
                        <div>
                            <label className="block text-white font-semibold mb-2">Endereço</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full p-3 bg-blue-900/60 text-white border border-blue-800/40 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60"
                                placeholder="Endereço completo"
                            />
                        </div>
                        <div>
                            <label className="block text-white font-semibold mb-2">PIX/Conta</label>
                            <input
                                type="text"
                                value={pixAccount}
                                onChange={(e) => setPixAccount(e.target.value)}
                                className="w-full p-3 bg-blue-900/60 text-white border border-blue-800/40 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60"
                                placeholder="Chave PIX ou conta"
                            />
                        </div>
                        <div>
                            <label className="block text-white font-semibold mb-2">Telefone</label>
                            <input
                                type="text"
                                value={telefone}
                                onChange={(e) => setTelefone(e.target.value)}
                                className="w-full p-3 bg-blue-900/60 text-white border border-blue-800/40 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60"
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-white font-semibold mb-2">Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full p-3 bg-blue-900/60 text-white border border-blue-800/40 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30 transition placeholder:text-white/60"
                                placeholder="Defina uma senha"
                            />
                        </div>
                        <div className="col-span-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full p-3 rounded-lg font-bold text-lg shadow-lg transition-all duration-200 ${
                                    loading
                                        ? 'bg-blue-700/60 opacity-60 cursor-not-allowed text-white'
                                        : 'bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white'
                                }`}
                            >
                                {loading ? 'Carregando...' : 'Adicionar Corretor'}
                            </button>
                        </div>
                    </div>
                </form>
                {successMessage && (
                    <div className="mt-4 p-4 bg-green-900/30 border border-green-800/50 text-white rounded-lg text-center font-semibold">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="mt-4 p-4 bg-red-900/30 border border-red-800/50 text-white rounded-lg text-center font-semibold">
                        {errorMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddCorretor;
