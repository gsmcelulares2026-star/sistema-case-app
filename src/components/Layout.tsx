import { useLocation, useNavigate } from 'react-router-dom'
import { FiHome, FiPackage, FiMap, FiBarChart2, FiCamera, FiFileText } from 'react-icons/fi'

const navItems = [
  { path: '/', icon: FiHome, label: 'Início' },
  { path: '/estoque', icon: FiPackage, label: 'Estoque' },
  { path: '/scanner', icon: FiCamera, label: 'Scanner' },
  { path: '/relatorios', icon: FiFileText, label: 'Relatórios' },
  { path: '/mapa', icon: FiMap, label: 'Mapa' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="app-layout">
      <main className="main-content">
        {children}
      </main>
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <item.icon size={22} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
