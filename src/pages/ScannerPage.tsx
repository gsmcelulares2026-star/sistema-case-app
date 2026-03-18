import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { caseService } from '../services/caseService'
import { VariantWithModel } from '../models/CaseModel'
import { FiCamera, FiSearch, FiMapPin } from 'react-icons/fi'

export default function ScannerPage() {
  const navigate = useNavigate()
  const [barcode, setBarcode] = useState('')
  const [result, setResult] = useState<VariantWithModel | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    if (!barcode.trim()) return
    setSearching(true)
    setNotFound(false)
    setResult(null)
    try {
      const item = await caseService.getByBarcode(barcode.trim())
      if (item) {
        setResult(item)
      } else {
        setNotFound(true)
      }
    } catch (err) {
      console.error('Erro na busca por barcode:', err)
      setNotFound(true)
    } finally {
      setSearching(false)
    }
  }

  const getStockColor = (qty: number) => {
    if (qty === 0) return 'var(--danger)'
    if (qty < 5) return 'var(--warning)'
    return 'var(--success)'
  }

  return (
    <div>
      <div className="top-bar">
        <h1 className="top-bar-title">📷 Scanner</h1>
      </div>

      <div className="scanner-container" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ color: 'var(--white)', textAlign: 'center', padding: 'var(--space-xl)' }}>
          <FiCamera size={48} style={{ marginBottom: 'var(--space-md)', opacity: 0.5 }} />
          <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.7 }}>
            Scanner de câmera disponível apenas no app nativo
          </p>
        </div>
        <div className="scanner-overlay">
          <div className="scanner-frame">
            <div className="scanner-line" />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="section-title">🔢 Buscar por Código da Capa</div>
        <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
          <input
            id="scanner-barcode"
            className="form-input"
            type="text"
            placeholder="Digite o código de barras"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          id="scanner-search"
          className="btn btn-primary btn-block"
          onClick={handleSearch}
          disabled={searching}
        >
          <FiSearch />
          {searching ? 'Buscando...' : 'Buscar Capa'}
        </button>
      </div>

      {notFound && (
        <div className="card" style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>❌</div>
          <div style={{ fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Capa não encontrada</div>
          <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-lg)' }}>
            Não temos capa registrada com este código!
          </p>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/adicionar')}
          >
            Cadastrar novo gancho/capa
          </button>
        </div>
      )}

      {result && (
        <div
          className="case-card"
          style={{ padding: 'var(--space-lg)' }}
          onClick={() => navigate(`/produto/${result.model_id}`)}
        >
          <div className="case-card-image" style={{ width: 64, height: 64, fontSize: '2rem' }}>
            {result.image_url ? <img src={result.image_url} alt={result.models?.name} /> : '📱'}
          </div>
          <div className="case-card-info">
            <div className="case-card-title">{result.models?.brand} {result.models?.name}</div>
            <div className="case-card-subtitle">{result.type} • {result.color}</div>
            <div className="case-card-location">
              <FiMapPin size={12} />
              Parede {result.models?.wall} • Col {result.models?.column} • Lin {result.models?.row}
            </div>
          </div>
          <div className="case-card-qty" style={{ alignItems: 'flex-end' }}>
            <div className="case-card-qty-number" style={{ color: getStockColor(result.quantity) }}>
              {result.quantity}
            </div>
            <div className="case-card-qty-label">un. desta capa</div>
          </div>
        </div>
      )}
    </div>
  )
}
