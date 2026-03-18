import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { caseService } from '../services/caseService'
import { ModelWithVariants, VariantWithModel } from '../models/CaseModel'
import { FiSearch, FiPlus, FiPackage, FiMap, FiLogOut, FiMapPin, FiAlertTriangle } from 'react-icons/fi'

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ModelWithVariants[]>([])
  const [lowStock, setLowStock] = useState<VariantWithModel[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigate()
  const { signOut, user } = useAuth()

  useEffect(() => {
    loadLowStock()
  }, [])

  const loadLowStock = async () => {
    try {
      const items = await caseService.getLowStockVariants(5)
      setLowStock(items)
    } catch (err) {
      console.error('Erro ao carregar estoque baixo:', err)
    }
  }

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q)
    if (q.trim().length < 2) {
      setResults([])
      setShowResults(false)
      return
    }
    setSearching(true)
    setShowResults(true)
    try {
      const data = await caseService.searchModels(q)
      setResults(data)
    } catch (err) {
      console.error('Erro na busca:', err)
    } finally {
      setSearching(false)
    }
  }, [])

  const getStockColor = (qty: number) => {
    if (qty === 0) return 'var(--danger)'
    if (qty < 5) return 'var(--warning)'
    return 'var(--success)'
  }

  return (
    <div>
      {/* Top Bar */}
      <div className="top-bar">
        <div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
            Olá, {user?.user_metadata?.name || 'Usuário'} 👋
          </div>
          <h1 className="top-bar-title">CapaStock</h1>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={signOut} title="Sair">
          <FiLogOut size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="search-container" style={{ marginBottom: 'var(--space-lg)' }}>
        <FiSearch className="search-icon" />
        <input
          id="home-search"
          className="search-input"
          type="text"
          placeholder="Buscar modelo de aparelho (Ex: M55)..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          autoComplete="off"
        />
      </div>

      {/* Search Results */}
      {showResults && (
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="section-title">
            {searching ? 'Buscando...' : `${results.length} gancho(s) encontrado(s)`}
          </div>
          {results.length === 0 && !searching && (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-title">Nenhum resultado</div>
              <p>Tente buscar por outro termo</p>
            </div>
          )}
          {results.map((item) => {
            const totalQty = item.case_variants?.reduce((acc, v) => acc + v.quantity, 0) || 0
            
            return (
              <div
                key={item.id}
                className="case-card"
                style={{ marginBottom: 'var(--space-sm)' }}
                onClick={() => navigate(`/produto/${item.id}`)}
              >
                <div className="case-card-image" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  📱
                </div>
                <div className="case-card-info">
                  <div className="case-card-title">{item.brand} {item.name}</div>
                  <div className="case-card-subtitle">
                    {item.case_variants?.length || 0} variações de capas
                  </div>
                  <div className="case-card-location">
                    <FiMapPin size={12} />
                    Parede {item.wall} • Col {item.column} • Linha {item.row}
                  </div>
                </div>
                <div className="case-card-qty">
                  <div className="case-card-qty-number" style={{ color: getStockColor(totalQty) }}>
                    {totalQty}
                  </div>
                  <div className="case-card-qty-label">totais</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick Actions */}
      {!showResults && (
        <>
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => navigate('/adicionar')}>
              <div className="quick-action-icon add"><FiPlus size={22} /></div>
              Adicionar
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/estoque')}>
              <div className="quick-action-icon stock"><FiPackage size={22} /></div>
              Estoque
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/mapa')}>
              <div className="quick-action-icon map"><FiMap size={22} /></div>
              Mapa
            </button>
          </div>

          {/* Low Stock Alert */}
          {lowStock.length > 0 && (
            <div>
              <div className="alert-banner warning">
                <FiAlertTriangle size={20} />
                <span><strong>{lowStock.length}</strong> variação(ões) com estoque baixo</span>
              </div>

              <div className="section-title">⚠️ Estoque Baixo (Capas Específicas)</div>
              {lowStock.slice(0, 5).map((variant) => (
                <div
                  key={variant.id}
                  className="case-card"
                  style={{ marginBottom: 'var(--space-sm)' }}
                  onClick={() => navigate(`/produto/${variant.model_id}`)}
                >
                  <div className="case-card-image">
                    {variant.image_url ? (
                      <img src={variant.image_url} alt={variant.models?.name} />
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>🎨</span>
                    )}
                  </div>
                  <div className="case-card-info">
                    <div className="case-card-title">{variant.models?.brand} {variant.models?.name}</div>
                    <div className="case-card-subtitle" style={{ fontWeight: '600', color: 'var(--text)' }}>
                      {variant.type} • {variant.color}
                    </div>
                    <div className="case-card-location">
                      <FiMapPin size={12} />
                      Parede {variant.models?.wall} • Col {variant.models?.column} • Linha {variant.models?.row}
                    </div>
                  </div>
                  <div className="case-card-qty">
                    <div className="case-card-qty-number" style={{ color: getStockColor(variant.quantity) }}>
                      {variant.quantity}
                    </div>
                    <div className="case-card-qty-label">un.</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
