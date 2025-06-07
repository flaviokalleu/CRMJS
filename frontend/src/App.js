import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useAuthPersistence } from './hooks/useAuthPersistence';
import AuthLoading from './components/AuthLoading';

// Importar suas páginas
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
import AlugueisPage from './pages/AlugueisPage';
import AddAluguelPage from './pages/AddAluguelPage';
import WhatsAppQRCodePage from './pages/WhatsAppQRCodePage';
import LandingPage from './pages/LandingPage';
import LembretesPage from './pages/Lembretes';
import AcessosList from './pages/AcessosList';
import ClientesAluguel from './pages/ClienteAluguelPage';
import RelatorioPage from './pages/RelatorioPage';
import PublicPropertyList from './pages/PublicImoveisPage';
import MoveisDetail from './pages/MoveisDetailPage';
import Busca from './components/Busca';
import EditarCliente from './pages/EditarCliente.jsx';

// Importando os Dashboards
import DashboardCorretor from './components/Dashboard/DashboardCorretor';
import DashboardCorrespondente from './components/Dashboard/DashboardCorrespondente';
import DashboardAdministrador from './components/Dashboard/DashboardAdministrador';

// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Componente para rotas públicas (redireciona se já logado)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Componente interno que usa useAuth
const AppContent = () => {
  const { loading } = useAuth();
  const [loadingComplete, setLoadingComplete] = useState(false);
  
  // Usar hook de persistência
  useAuthPersistence();

  const handleLoadingComplete = () => {
    setLoadingComplete(true);
  };

  useEffect(() => {
    setLoadingComplete(false);
    const timer = setTimeout(() => {
      handleLoadingComplete();
    }, 1000); // Dar tempo para carregar

    return () => clearTimeout(timer);
  }, []);

  // Se ainda está verificando autenticação, mostrar loading
  if (loading) {
    return <AuthLoading />;
  }

  return (
    <div className="App">
      {!loadingComplete ? (
        <LoadingScreen onComplete={handleLoadingComplete} />
      ) : (
        <Routes>
          {/* Rotas públicas */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Landing page pública */}
          <Route path="/landing" element={<LandingPage />} />
          
          {/* Rotas públicas de imóveis */}
          <Route path="/imoveis" element={<PublicPropertyList />} />
          <Route path="/imoveis/:id" element={<MoveisDetail />} />
          <Route path="/busca" element={<Busca />} />

          {/* Rotas protegidas principais */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute>
                <Configuracoes />
              </ProtectedRoute>
            }
          />

          {/* Dashboards específicos por tipo de usuário */}
          <Route 
            path="/dashboard/corretor" 
            element={
              <ProtectedRoute>
                <DashboardCorretor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/correspondente" 
            element={
              <ProtectedRoute>
                <DashboardCorrespondente />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/administrador" 
            element={
              <ProtectedRoute>
                <DashboardAdministrador />
              </ProtectedRoute>
            } 
          />
          
          {/* Rotas de Clientes */}
          <Route 
            path="/clientes/adicionar" 
            element={
              <ProtectedRoute>
                <AddCliente />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/clientes/lista" 
            element={
              <ProtectedRoute>
                <ListaClientes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/editar-cliente/:id" 
            element={
              <ProtectedRoute>
                <EditarCliente />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/clientes-aluguel" 
            element={
              <ProtectedRoute>
                <ClientesAluguel />
              </ProtectedRoute>
            } 
          />

          {/* Rotas de Corretores */}
          <Route 
            path="/corretores/adicionar" 
            element={
              <ProtectedRoute>
                <AddCorretor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/corretores/lista" 
            element={
              <ProtectedRoute>
                <ListaCorretores />
              </ProtectedRoute>
            } 
          />

          {/* Rotas de Correspondentes */}
          <Route 
            path="/correspondentes/adicionar" 
            element={
              <ProtectedRoute>
                <AddCorrespondente />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/correspondentes/lista" 
            element={
              <ProtectedRoute>
                <ListaCorrespondentesPage />
              </ProtectedRoute>
            } 
          />

          {/* Rotas de Imóveis */}
          <Route 
            path="/imoveis/adicionar" 
            element={
              <ProtectedRoute>
                <AddImovel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/imoveis/lista" 
            element={
              <ProtectedRoute>
                <ListaImoveis />
              </ProtectedRoute>
            } 
          />

          {/* Rotas de Proprietários */}
          <Route 
            path="/proprietarios/lista" 
            element={
              <ProtectedRoute>
                <ListaProprietarios />
              </ProtectedRoute>
            } 
          />

          {/* Rotas de Aluguéis */}
          <Route 
            path="/alugueis" 
            element={
              <ProtectedRoute>
                <AlugueisPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/alugueis/adicionar" 
            element={
              <ProtectedRoute>
                <AddAluguelPage />
              </ProtectedRoute>
            } 
          />

          {/* Outras rotas protegidas */}
          <Route 
            path="/whatsapp-qr" 
            element={
              <ProtectedRoute>
                <WhatsAppQRCodePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lembretes" 
            element={
              <ProtectedRoute>
                <LembretesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/acessos" 
            element={
              <ProtectedRoute>
                <AcessosList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/relatorio" 
            element={
              <ProtectedRoute>
                <RelatorioPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirecionar raiz para dashboard ou login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Rota 404 - redireciona para dashboard se logado ou login se não logado */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      )}
    </div>
  );
};

// Componente principal do App
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
