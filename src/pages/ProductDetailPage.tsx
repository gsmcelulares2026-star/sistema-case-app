import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { caseService } from '../services/caseService'
import { movementService } from '../services/movementService'
import { ModelWithVariants, VariantFormData, CASE_TYPES, COLORS } from '../models/CaseModel'
import { FiArrowLeft, FiPlus, FiMinus, FiEdit, FiMapPin, FiClock, FiTrash2, FiSave } from 'react-icons/fi'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [modelData, setModelData] = useState<ModelWithVariants | null>(null)
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal states for Movement
  const [showMoveModal, setShowMoveModal] = useState<'in' | 'out' | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [processing, setProcessing] = useState(false)

  // Modal states for New Variant
  const [showAddVariantModal, setShowAddVariantModal] = useState(false)
  const [newVariant, setNewVariant] = useState<VariantFormData>({
    type: 'Silicone', color: 'Preto', quantity: 1, barcode: '', image_url: ''
  })

  useEffect(() => {
    if (id) loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [item, movs] = await Promise.all([
        caseService.getModelById(id!),
        movementService.getByModelId(id!)
      ])
      setModelData(item)
      setMovements(movs)
    } catch (err) {
      console.error('Erro ao carregar produto:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMovement = async () => {
    if (!showMoveModal || !selectedVariantId || qty < 1) return
    setProcessing(true)
    try {
      await movementService.registerMovement(selectedVariantId, showMoveModal, qty)
      setShowMoveModal(null)
      setSelectedVariantId(null)
      setQty(1)
      await loadData()
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar movimentação')
    } finally {
      setProcessing(false)
    }
  }

  const handleAddVariant = async () => {
    if (!id) return
    setProcessing(true)
    try {
      await caseService.addVariant(id, newVariant)
      setShowAddVariantModal(false)
      setNewVariant({ type: 'Silicone', color: 'Preto', quantity: 1, barcode: '', image_url: '' })
      await loadData()
    } catch (err: any) {
      alert(err.message || 'Erro ao adicionar capa')
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteModel = async () => {
    if (!id) return
    if (!confirm('Tem certeza que deseja excluir ESTE GANCHO INTEIRO e todas as suas capas?')) return
    try {
      await caseService.deleteModel(id)
      navigate('/')
    } catch (err) {
      alert('Erro ao excluir gancho')
    }
  }

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Excluir esta variação de capa?')) return
    try {
      await caseService.deleteVariant(variantId)
      await loadData()
    } catch (err) {
      alert('Erro')
    }
  }

  const getStockColor = (qty: number) => {
    if (qty === 0) return 'var(--danger)'
    if (qty < 5) return 'var(--warning)'
    return 'var(--success)'
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Carregando...</p></div>
  }

  if (!modelData) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">❌</div>
        <div className="empty-state-title">Gancho não encontrado</div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Voltar</button>
      </div>
    )
  }

  const totalQty = modelData.case_variants?.reduce((acc, v) => acc + v.quantity, 0) || 0

  return (
    <div>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>
        <h1 className="page-title">Detalhes do Gancho</h1>
      </div>

      {/* Model Info */}
      <div className="product-hero">
        <div className="product-image" style={{ fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          📱
        </div>
        <div className="product-info">
          <div className="product-brand">{modelData.brand}</div>
          <div className="product-model">{modelData.name}</div>
          <div className="product-meta" style={{ marginTop: '8px' }}>
            <span className="badge badge-info">{modelData.case_variants?.length || 0} variações</span>
            <span className="badge" style={{ backgroundColor: getStockColor(totalQty), color: '#fff' }}>
              {totalQty} un. totais
            </span>
          </div>
        </div>
      </div>

      <div className="product-location-card">
        <div className="product-location-label">
          <FiMapPin size={14} style={{ verticalAlign: 'middle' }} /> Localização Física
        </div>
        <div className="product-location-value">
          <span>Parede {modelData.wall}</span>
          <span>•</span>
          <span>C{modelData.column}</span>
          <span>•</span>
          <span>L{modelData.row}</span>
        </div>
      </div>

      <div className="product-actions">
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate(`/editar/${modelData.id}`)}>
          <FiEdit /> Editar Gancho
        </button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setShowAddVariantModal(true)}>
          <FiPlus /> Add Capa
        </button>
      </div>

      {/* Variants List */}
      <div className="section-title" style={{ marginTop: 'var(--space-lg)' }}>🎨 Capas Físicas Neste Gancho</div>
      {modelData.case_variants?.length === 0 ? (
        <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
          <p>Nenhuma capa cadastrada neste gancho.</p>
        </div>
      ) : (
        modelData.case_variants?.map(variant => (
          <div key={variant.id} className="card" style={{ marginBottom: 'var(--space-sm)', padding: 'var(--space-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>{variant.type} • {variant.color}</strong>
                {variant.barcode && <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Cód: {variant.barcode}</span>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getStockColor(variant.quantity) }}>
                  {variant.quantity}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', display: 'block' }}>un.</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-success" 
                style={{ flex: 1, padding: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                onClick={() => { setSelectedVariantId(variant.id); setShowMoveModal('in'); }}
              >
                <FiPlus /> Entrou
              </button>
              <button 
                className="btn btn-danger" 
                style={{ flex: 1, padding: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                onClick={() => { setSelectedVariantId(variant.id); setShowMoveModal('out'); }}
                disabled={variant.quantity === 0}
              >
                <FiMinus /> Saiu
              </button>
              <button 
                className="btn btn-outline" 
                style={{ padding: '8px' }}
                onClick={() => handleDeleteVariant(variant.id)}
              >
                <FiTrash2 className="icon-danger" />
              </button>
            </div>
          </div>
        ))
      )}

      {/* Movement History */}
      <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
        <div className="section-title"><FiClock /> Histórico do Gancho</div>
        {movements.length === 0 ? (
          <div style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-sm)', padding: 'var(--space-md) 0' }}>
            Nenhuma movimentação registrada
          </div>
        ) : (
          movements.slice(0, 10).map((m) => (
            <div key={m.id} className="movement-item">
              <div className={`movement-icon ${m.type}`}>
                {m.type === 'in' ? <FiPlus /> : <FiMinus />}
              </div>
              <div className="movement-info">
                <div className="movement-type">
                  {m.type === 'in' ? 'Entrada' : 'Saída'} - {m.case_variants?.type} {m.case_variants?.color}
                </div>
                <div className="movement-date">{formatDate(m.created_at)}</div>
              </div>
              <div className="movement-qty" style={{ color: m.type === 'in' ? 'var(--success)' : 'var(--danger)' }}>
                {m.type === 'in' ? '+' : '-'}{m.quantity}
              </div>
            </div>
          ))
        )}
      </div>

      <button
        className="btn btn-ghost btn-block"
        style={{ color: 'var(--danger)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}
        onClick={handleDeleteModel}
      >
        <FiTrash2 /> Excluir Gancho Inteiro
      </button>

      {/* In/Out Modal */}
      {showMoveModal && (
        <div className="modal-overlay" onClick={() => {setShowMoveModal(null); setSelectedVariantId(null)}}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">
              {showMoveModal === 'in' ? '📦 Registrar Entrada' : '📤 Registrar Saída'}
            </div>
            <div className="form-group">
              <label className="form-label">Quantidade</label>
              <input
                className="form-input"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowMoveModal(null)}>Cancelar</button>
              <button
                className={`btn ${showMoveModal === 'in' ? 'btn-success' : 'btn-danger'}`}
                style={{ flex: 1 }}
                onClick={handleMovement}
                disabled={processing}
              >
                {processing ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Variant Modal */}
      {showAddVariantModal && (
        <div className="modal-overlay" onClick={() => setShowAddVariantModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">➕ Adicionar Nova Capa</div>
            
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select className="form-select" value={newVariant.type} onChange={e => setNewVariant({...newVariant, type: e.target.value})}>
                {CASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cor</label>
              <select className="form-select" value={newVariant.color} onChange={e => setNewVariant({...newVariant, color: e.target.value})}>
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantidade Inicial</label>
              <input className="form-input" type="number" min={0} value={newVariant.quantity} onChange={e => setNewVariant({...newVariant, quantity: parseInt(e.target.value)||0})} />
            </div>
            <div className="form-group">
              <label className="form-label">Código de Barras (Opcional)</label>
              <input className="form-input" type="text" value={newVariant.barcode} onChange={e => setNewVariant({...newVariant, barcode: e.target.value})} />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowAddVariantModal(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddVariant} disabled={processing}>
                {processing ? 'Salvando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
