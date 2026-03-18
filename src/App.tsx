import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ProductDetailPage from './pages/ProductDetailPage'
import AddCasePage from './pages/AddCasePage'
import StockPage from './pages/StockPage'
import StoreMapPage from './pages/StoreMapPage'
import ScannerPage from './pages/ScannerPage'
import DashboardPage from './pages/DashboardPage'
import ReportsPage from './pages/ReportsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <p>Carregando...</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/produto/:id" element={<ProductDetailPage />} />
                <Route path="/adicionar" element={<AddCasePage />} />
                <Route path="/editar/:id" element={<AddCasePage />} />
                <Route path="/estoque" element={<StockPage />} />
                <Route path="/mapa" element={<StoreMapPage />} />
                <Route path="/scanner" element={<ScannerPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/relatorios" element={<ReportsPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
