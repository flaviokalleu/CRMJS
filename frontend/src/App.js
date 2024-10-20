import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddCliente from './pages/AddCliente';
import Configuracoes from './pages/Configuracoes';
import AddCorretor from './pages/AddCorretor';
import AddCorrespondente from './pages/AddCorrespondente';
import AddImovel from './pages/AddImovel';
import ListaProprietarios from './pages/ListaProprietarios';
import ListaClientes from './pages/ListaClientes';
import ListaImoveis from './pages/ListaImoveis';
import ListaCorretores from './pages/ListaCorretores';
import ListaCorrespondentesPage from './pages/ListaCorrespondentesPage';
import LoadingScreen from './components/LoadingScreen';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';
import AlugueisPage from './pages/AlugueisPage';
import AddAluguelPage from './pages/AddAluguelPage';
import WhatsAppQRCodePage from './pages/WhatsAppQRCodePage';
import LandingPage from './pages/LandingPage';
import LembretesPage from './pages/Lembretes';
import AcessosList from './pages/AcessosList';
import ClientesAluguel from './pages/ClienteAluguelPage'; // Corrigido para importar a página correta
import RelatorioPage from './pages/RelatorioPage'; // Importando o novo componente
import PublicPropertyList from './pages/PublicImoveisPage';
import MoveisDetail from './pages/MoveisDetailPage';
import Busca from './components/Busca'; // Componente que irá lidar com a busca
import EditarCliente from './pages/EditarCliente.jsx'; // Certifique-se de que o caminho está correto

// Importando os Dashboards
import DashboardCorretor from './components/Dashboard/DashboardCorretor';
import DashboardCorrespondente from './components/Dashboard/DashboardCorrespondente';
import DashboardAdministrador from './components/Dashboard/DashboardAdministrador';

const App = () => {
    const { isAuthenticated } = useAuth();
    const [loadingComplete, setLoadingComplete] = useState(false);

    const handleLoadingComplete = () => {
        setLoadingComplete(true);
    };

    useEffect(() => {
        setLoadingComplete(false);
        handleLoadingComplete();
    }, []);

    return (
        <div className="App">
            {!loadingComplete ? (
                <LoadingScreen onComplete={handleLoadingComplete} />
            ) : (
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/dashboard" element={<PrivateRoute element={<DashboardPage />} />} />
                    {/* Rotas dos Dashboards */}
                    <Route path="/dashboard/corretor" element={<PrivateRoute element={<DashboardCorretor />} />} />
                    <Route path="/dashboard/correspondente" element={<PrivateRoute element={<DashboardCorrespondente />} />} />
                    <Route path="/dashboard/administrador" element={<PrivateRoute element={<DashboardAdministrador />} />} />
                    
                    {/* Outras Rotas */}
                    <Route path="/clientes/adicionar" element={<PrivateRoute element={<AddCliente />} />} />
                    <Route path="/corretores/adicionar" element={<PrivateRoute element={<AddCorretor />} />} />
                    <Route path="/correspondentes/adicionar" element={<PrivateRoute element={<AddCorrespondente />} />} />
                    <Route path="/imoveis/adicionar" element={<PrivateRoute element={<AddImovel />} />} />
                    <Route path="/proprietarios/lista" element={<PrivateRoute element={<ListaProprietarios />} />} />
                    <Route path="/clientes/lista" element={<PrivateRoute element={<ListaClientes />} />} />
                    <Route path="/editar-cliente/:id" element={<PrivateRoute element={<EditarCliente />} />} /> 
                    <Route path="/imoveis/lista" element={<PrivateRoute element={<ListaImoveis />} />} />
                    <Route path="/corretores/lista" element={<PrivateRoute element={<ListaCorretores />} />} />
                    <Route path="/correspondentes/lista" element={<PrivateRoute element={<ListaCorrespondentesPage />} />} />
                    <Route path="/configuracoes" element={<PrivateRoute element={<Configuracoes />} />} />
                    <Route path="/alugueis" element={<PrivateRoute element={<AlugueisPage />} />} />
                    <Route path="/alugueis/adicionar" element={<PrivateRoute element={<AddAluguelPage />} />} />
                    <Route path="/whatsapp-qr" element={<PrivateRoute element={<WhatsAppQRCodePage />} />} />
                    <Route path="/lembretes" element={<PrivateRoute element={<LembretesPage />} />} />
                    <Route path="/acessos" element={<PrivateRoute element={<AcessosList />} />} />
                    <Route path="/clientes-aluguel" element={<ClientesAluguel />} /> {/* Corrigido para usar element */}
                    <Route path="/relatorio" element={<PrivateRoute element={<RelatorioPage />} />} />
                    <Route path="/imoveis" element={<PublicPropertyList />} />
                    <Route path="/imoveis/:id" element={<MoveisDetail />} /> {/* Rota para detalhes do imóvel */}
                    <Route path="/busca" element={<Busca />} /> {/* Rota para busca */}
                    </Routes>
               
            )}
        </div>
    );
};

export default App;
