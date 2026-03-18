import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { caseService } from '../services/caseService'
import { movementService } from '../services/movementService'
import { ModelWithVariants, VariantWithModel } from '../models/CaseModel'
import { MovementWithVariant } from '../models/MovementModel'
import { FiTrendingDown, FiTrendingUp, FiAlertCircle, FiPackage, FiMapPin, FiClock, FiPlus, FiMinus } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [lowStockVariants, setLowStockVariants] = useState<VariantWithModel[]>([])
  const [topSold, setTopSold] = useState<any[]>([])
  const [recentMovements, setRecentMovements] = useState<MovementWithVariant[]>([])
  const [allModels, setAllModels] = useState<ModelWithVariants[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [low, top, recent, all] = await Promise.all([
        caseService.getLowStockVariants(5),
        movementService.getTopSold(5),
        movementService.getRecent(10),
        caseService.getAllModels()
      ])
      setLowStockVariants(low)
      setTopSold(top)
      setRecentMovements(recent)
      setAllModels(all)
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalGanchos = allModels.length
  
  let totalUnits = 0
  let outOfStockGanchos = 0
  
  const brandDistribution: Record<string, number> = {}

  allModels.forEach(m => {
    const qty = m.case_variants?.reduce((s, v) => s + v.quantity, 0) || 0
    totalUnits += qty
    if (qty === 0) outOfStockGanchos++
    
    brandDistribution[m.brand] = (brandDistribution[m.brand] || 0) + qty
  })

  const lowStockCount = lowStockVariants.length

  const brandChartData = Object.entries(brandDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const CHART_COLORS = ['#1565C0', '#1E88E5', '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB']

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    })
  }

  const getStockColor = (qty: number) => {
    if (qty === 0) return 'var(--danger)'
    if (qty < 5) return 'var(--warning)'
    return 'var(--success)'
  }

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Carregando dashboard...</p></div>
  }

  return (
    <div>
      <div className="top-bar">
        <h1 className="top-bar-title">📊 Dashboard</h1>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ color: 'var(--primary)' }}><FiPackage /></div>
          <div className="stat-card-value">{totalGanchos}</div>
          <div className="stat-card-label">Ganchos Ativos</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ color: 'var(--success)' }}><FiTrendingUp /></div>
          <div className="stat-card-value">{totalUnits}</div>
          <div className="stat-card-label">Capas (Total)</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ color: 'var(--warning)' }}><FiAlertCircle /></div>
          <div className="stat-card-value">{lowStockCount}</div>
          <div className="stat-card-label">Quedas de Estoque</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ color: 'var(--danger)' }}><FiTrendingDown /></div>
          <div className="stat-card-value">{outOfStockGanchos}</div>
          <div className="stat-card-label">Ganchos Vazios</div>
        </div>
      </div>

      {brandChartData.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="section-title">📈 Total Físico por Marca</div>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={brandChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {brandChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {topSold.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="section-title">🏆 Mais Vendidos (Saídas)</div>
          {topSold.map((item, idx) => (
            <div key={item.variant_id} className="movement-item">
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--radius-full)',
                background: idx < 3 ? 'var(--accent)' : 'var(--gray-300)',
                color: idx < 3 ? 'var(--white)' : 'var(--gray-600)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 'var(--font-size-sm)', flexShrink: 0
              }}>
                {idx + 1}
              </div>
              <div className="movement-info">
                <div className="movement-type">{item.brand} {item.name || item.model}</div>
                <div className="movement-date">{item.type} {item.color}</div>
              </div>
              <div className="movement-qty" style={{ color: 'var(--accent)' }}>
                {item.total} un.
              </div>
            </div>
          ))}
        </div>
      )}

      {lowStockVariants.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="section-title">⚠️ Capas em Estoque Baixo</div>
          {lowStockVariants.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="case-card"
              style={{ marginBottom: 'var(--space-sm)', boxShadow: 'none', border: '1px solid var(--gray-100)' }}
              onClick={() => navigate(`/produto/${item.model_id}`)}
            >
              <div className="case-card-info">
                <div className="case-card-title">{item.models?.brand} {item.models?.name}</div>
                <div className="case-card-subtitle">{item.type} • {item.color}</div>
                <div className="case-card-location">
                  <FiMapPin size={12} />
                  {item.models?.wall}-C{item.models?.column}-L{item.models?.row}
                </div>
              </div>
              <div className="case-card-qty">
                <div className="case-card-qty-number" style={{ color: getStockColor(item.quantity) }}>
                  {item.quantity}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {recentMovements.length > 0 && (
        <div className="card">
          <div className="section-title"><FiClock /> Movimentações Recentes</div>
          {recentMovements.map((m) => (
            <div key={m.id} className="movement-item">
              <div className={`movement-icon ${m.type}`}>
                {m.type === 'in' ? <FiPlus size={14} /> : <FiMinus size={14} />}
              </div>
              <div className="movement-info">
                <div className="movement-type">
                  {m.case_variants?.models?.brand} {m.case_variants?.models?.name}
                </div>
                <div className="movement-date">
                  {m.case_variants?.type} {m.case_variants?.color} • {formatDate(m.created_at)}
                </div>
              </div>
              <div className="movement-qty" style={{ color: m.type === 'in' ? 'var(--success)' : 'var(--danger)' }}>
                {m.type === 'in' ? '+' : '-'}{m.quantity}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
