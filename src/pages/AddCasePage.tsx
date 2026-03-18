import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { caseService } from '../services/caseService'
import { ModelFormData, VariantFormData, BRANDS, CASE_TYPES, WALLS, COLORS } from '../models/CaseModel'
import { FiArrowLeft, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi'

export default function AddCasePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Model state
  const [modelForm, setModelForm] = useState<ModelFormData>({
    brand: 'Samsung',
    name: '',
    wall: 'A',
    column: 1,
    row: 1
  })

  // Variants state (only for creation)
  const [variants, setVariants] = useState<VariantFormData[]>([
    { type: 'Silicone', color: 'Transparente', quantity: 1, barcode: '', image_url: '' }
  ])

  useEffect(() => {
    if (id) {
      setLoading(true)
      caseService.getModelById(id).then((item) => {
        if (item) {
          setModelForm({
            brand: item.brand,
            name: item.name,
            wall: item.wall,
            column: item.column,
            row: item.row
          })
        }
      }).finally(() => setLoading(false))
    }
  }, [id])

  const handleModelChange = (field: keyof ModelFormData, value: string | number) => {
    setModelForm(prev => ({ ...prev, [field]: value }))
  }

  const handleVariantChange = (index: number, field: keyof VariantFormData, value: string | number) => {
    const newVariants = [...variants];
    (newVariants[index] as any)[field] = value;
    setVariants(newVariants);
  }

  const addVariant = () => {
    setVariants([...variants, { type: 'Silicone', color: 'Preto', quantity: 1, barcode: '', image_url: '' }])
  }

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modelForm.name.trim()) {
      alert('Informe o modelo do aparelho')
      return
    }
    setSaving(true)
    try {
      if (isEditing && id) {
        await caseService.updateModel(id, modelForm)
      } else {
        await caseService.createModelWithVariants(modelForm, variants)
      }
      navigate(-1)
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>
  }

  return (
    <div>
      <div className="page-header">
        <button className="back-btn" type="button" onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>
        <h1 className="page-title">{isEditing ? 'Editar Modelo' : 'Novo Gancho (Modelo)'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>📱 Detalhes do Aparelho</h3>
          
          <div className="form-group">
            <label className="form-label">Marca</label>
            <select
              className="form-select"
              value={modelForm.brand}
              onChange={(e) => handleModelChange('brand', e.target.value)}
            >
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Modelo do Aparelho *</label>
            <input
              className="form-input"
              type="text"
              placeholder="Ex: iPhone 13, Moto G60"
              value={modelForm.name}
              onChange={(e) => handleModelChange('name', e.target.value)}
              required
            />
          </div>

          <div className="section-title" style={{ marginTop: 'var(--space-md)' }}>📍 Localização Física</div>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Parede</label>
              <select
                className="form-select"
                value={modelForm.wall}
                onChange={(e) => handleModelChange('wall', e.target.value)}
              >
                {WALLS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Coluna</label>
              <input
                className="form-input"
                type="number"
                min={1}
                value={modelForm.column}
                onChange={(e) => handleModelChange('column', parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Linha</label>
              <input
                className="form-input"
                type="number"
                min={1}
                value={modelForm.row}
                onChange={(e) => handleModelChange('row', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
        </div>

        {!isEditing && (
          <div className="card" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🎨 Capas no Gancho</h3>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={addVariant}
                style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '6px 12px', fontSize: '0.85rem' }}
              >
                <FiPlus /> Adicionar Outra
              </button>
            </div>
            
            {variants.map((variant, idx) => (
              <div key={idx} style={{ 
                border: '1px solid var(--border)', 
                borderRadius: '8px', 
                padding: 'var(--space-sm)', 
                marginBottom: 'var(--space-sm)',
                backgroundColor: 'var(--surface)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.9rem' }}>Capa #{idx + 1}</strong>
                  {variants.length > 1 && (
                    <button type="button" onClick={() => removeVariant(idx)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: '8px', flex: 2 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Tipo</label>
                    <select
                      className="form-select"
                      style={{ padding: '6px', fontSize: '0.9rem' }}
                      value={variant.type}
                      onChange={(e) => handleVariantChange(idx, 'type', e.target.value)}
                    >
                      {CASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '8px', flex: 2 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Cor</label>
                    <select
                      className="form-select"
                      style={{ padding: '6px', fontSize: '0.9rem' }}
                      value={variant.color}
                      onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                    >
                      {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '8px', flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Qtd</label>
                    <input
                      className="form-input"
                      style={{ padding: '6px', fontSize: '0.9rem' }}
                      type="number"
                      min={0}
                      value={variant.quantity}
                      onChange={(e) => handleVariantChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                {/* Optional advanced fields can be toggled, but skipping them here to keep UI clean */}
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={saving}
          style={{ marginBottom: 'var(--space-xl)' }}
        >
          <FiSave style={{ marginRight: '8px' }} />
          {saving ? 'Salvando...' : isEditing ? 'Salvar Modelo' : 'Criar Gancho e Adicionar Capas'}
        </button>
      </form>
    </div>
  )
}
