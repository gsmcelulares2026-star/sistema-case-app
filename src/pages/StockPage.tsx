import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { caseService } from '../services/caseService'
import { ModelWithVariants, BRANDS } from '../models/CaseModel'
import { FiSearch, FiMapPin, FiAlertTriangle } from 'react-icons/fi'

export default function StockPage() {
  const navigate = useNavigate()
  const [models, setModels] = useState<ModelWithVariants[]>([])
  const [filtered, setFiltered] = useState<ModelWithVariants[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('Todos')

  useEffect(() => {
    loadModels()
  }, [])

  useEffect(() => {
    filterModels()
  }, [models, search, brandFilter])

  const loadModels = async () => {
    try {
      const data = await caseService.getAllModels()
      setModels(data)
    } catch (err) {
      console.error('Erro ao carregar estoque:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterModels = () => {
    let result = [...models]
    if (brandFilter !== 'Todos') {
      result = result.filter(c => c.brand === brandFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }

  const getStockColor = (qty: number) => {
    if (qty === 0) return 'var(--danger)'
    if (qty < 5) return 'var(--warning)'
    return 'var(--success)'
  }

  const totalGanchos = models.length
  const totalItems = models.reduce((sum, m) => sum + (m.case_variants?.reduce((s, v) => s + v.quantity, 0) || 0), 0)
  
  // A model is low stock if its total quantity is < 5 AND it has variants
  const lowStockCount = models.filter(m => {
    const qty = m.case_variants?.reduce((s, v) => s + v.quantity, 0) || 0
    return qty < 5 && qty > 0
  }).length

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Carregando estoque...</p></div>
  }

  return (
    <div>
      <div className="top-bar">
        <h1 className="top-bar-title">📦 Estoque Geral</h1>
      </div>

      {/* Stats */}
      <div className="stat-cards" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="stat-card">
          <div className="stat-card-value">{totalGanchos}</div>
          <div className="stat-card-label">Ganchos (Modelos)</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{totalItems}</div>
          <div className="stat-card-label">Capas Físicas Únicas</div>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="alert-banner warning">
          <FiAlertTriangle size={18} />
          <span><strong>{lowStockCount}</strong> gancho(s) com estoque total crítico</span>
        </div>
      )}

      {/* Search */}
      <div className="search-container" style={{ marginBottom: 'var(--space-md)' }}>
        <FiSearch className="search-icon" />
        <input
          id="stock-search"
          className="search-input"
          type="text"
          placeholder="Filtrar aparelhos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Brand Filter */}
      <div className="filter-chips">
        <button
          className={`filter-chip ${brandFilter === 'Todos' ? 'active' : ''}`}
          onClick={() => setBrandFilter('Todos')}
        >
          Todos
        </button>
        {BRANDS.map(b => (
          <button
            key={b}
            className={`filter-chip ${brandFilter === b ? 'active' : ''}`}
            onClick={() => setBrandFilter(b)}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Stock List */}
      <div className="section-title">
        {filtered.length} aparelho(s)
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-title">Nenhum aparelho encontrado</div>
        </div>
      ) : (
        filtered.map((item) => {
          const totalQty = item.case_variants?.reduce((s, v) => s + v.quantity, 0) || 0
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
                <div className="case-card-subtitle">{item.case_variants?.length || 0} variações de cores/tipos</div>
                <div className="case-card-location">
                  <FiMapPin size={12} />
                  Parede {item.wall} • Col {item.column} • Linha {item.row}
                </div>
              </div>
              <div className="case-card-qty">
                <div className="case-card-qty-number" style={{ color: getStockColor(totalQty) }}>
                  {totalQty}
                </div>
                <div className="case-card-qty-label">un.</div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
