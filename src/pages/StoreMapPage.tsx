import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { caseService } from '../services/caseService'
import { ModelWithVariants, WALLS } from '../models/CaseModel'
import { FiMapPin } from 'react-icons/fi'

const GRID_COLS = 8
const GRID_ROWS = 6

export default function StoreMapPage() {
  const navigate = useNavigate()
  const [activeWall, setActiveWall] = useState('A')
  const [wallModels, setWallModels] = useState<ModelWithVariants[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCell, setSelectedCell] = useState<{ col: number; row: number } | null>(null)
  const [cellModels, setCellModels] = useState<ModelWithVariants[]>([])

  useEffect(() => {
    loadWallData()
  }, [activeWall])

  const loadWallData = async () => {
    setLoading(true)
    try {
      const data = await caseService.getModelsByLocation(activeWall)
      setWallModels(data)
    } catch (err) {
      console.error('Erro ao carregar mapa:', err)
    } finally {
      setLoading(false)
    }
  }

  const getCellData = (col: number, row: number) => {
    const items = wallModels.filter(c => c.column === col && c.row === row)
    const totalQty = items.reduce((sum, m) => sum + (m.case_variants?.reduce((s, v) => s + v.quantity, 0) || 0), 0)
    return { items, totalQty, count: items.length }
  }

  const getCellStatus = (totalQty: number, count: number) => {
    if (count === 0) return 'empty'
    if (totalQty === 0) return 'critical'
    if (totalQty < 5) return 'low'
    return 'ok'
  }

  const handleCellClick = (col: number, row: number) => {
    const { items } = getCellData(col, row)
    setSelectedCell({ col, row })
    setCellModels(items)
  }

  const getStockColor = (qty: number) => {
    if (qty === 0) return 'var(--danger)'
    if (qty < 5) return 'var(--warning)'
    return 'var(--success)'
  }

  return (
    <div>
      <div className="top-bar">
        <h1 className="top-bar-title">🗺️ Mapa da Loja</h1>
      </div>

      <div className="map-tabs">
        {WALLS.map(w => (
          <button
            key={w}
            className={`map-tab ${activeWall === w ? 'active' : ''}`}
            onClick={() => { setActiveWall(w); setSelectedCell(null) }}
          >
            Parede {w}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', fontSize: 'var(--font-size-xs)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--gray-100)', border: '1px solid var(--gray-300)', display: 'inline-block' }} />
          Sem Ganchos
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--success-light)', border: '1px solid #C8E6C9', display: 'inline-block' }} />
          OK
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--warning-light)', border: '1px solid #FFE082', display: 'inline-block' }} />
          Baixo Estoque
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--danger-light)', border: '1px solid #EF9A9A', display: 'inline-block' }} />
          Gancho Zerado
        </span>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: `40px repeat(${GRID_COLS}, 1fr)`, gap: 6, marginBottom: 6 }}>
            <div />
            {Array.from({ length: GRID_COLS }, (_, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--gray-500)' }}>
                C{i + 1}
              </div>
            ))}
          </div>

          {Array.from({ length: GRID_ROWS }, (_, rowIdx) => (
            <div key={rowIdx} style={{ display: 'grid', gridTemplateColumns: `40px repeat(${GRID_COLS}, 1fr)`, gap: 6, marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--gray-500)' }}>
                L{rowIdx + 1}
              </div>
              {Array.from({ length: GRID_COLS }, (_, colIdx) => {
                const { totalQty, count } = getCellData(colIdx + 1, rowIdx + 1)
                const status = getCellStatus(totalQty, count)
                const isSelected = selectedCell?.col === colIdx + 1 && selectedCell?.row === rowIdx + 1
                return (
                  <div
                    key={colIdx}
                    className={`grid-cell ${status}`}
                    style={isSelected ? { borderColor: 'var(--primary)', borderWidth: 3 } : {}}
                    onClick={() => handleCellClick(colIdx + 1, rowIdx + 1)}
                  >
                    {count > 0 && (
                      <>
                        <div className="grid-cell-count">{totalQty}</div>
                        <div className="grid-cell-label">{count} ganchos</div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {selectedCell && (
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <div className="section-title">
            <FiMapPin /> Parede {activeWall} • Coluna {selectedCell.col} • Linha {selectedCell.row}
          </div>
          {cellModels.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
              <div className="empty-state-title">Posição vazia</div>
              <p style={{ fontSize: 'var(--font-size-sm)' }}>Nenhum gancho nesta posição</p>
            </div>
          ) : (
            cellModels.map((item) => {
              const totalQty = item.case_variants?.reduce((s, v) => s + v.quantity, 0) || 0;
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
                    <div className="case-card-subtitle">{item.case_variants?.length || 0} variações de capas</div>
                  </div>
                  <div className="case-card-qty" style={{ alignItems: 'flex-end' }}>
                    <div className="case-card-qty-number" style={{ color: getStockColor(totalQty) }}>
                      {totalQty}
                    </div>
                    <div className="case-card-qty-label">totais</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  )
}
