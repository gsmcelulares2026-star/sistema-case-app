import { useState, useEffect } from 'react'
import { caseService } from '../services/caseService'
import { VariantWithModel, COLORS } from '../models/CaseModel'
import { FiSearch, FiDownload, FiFileText } from 'react-icons/fi'
import * as XLSX from 'xlsx'

export default function ReportsPage() {
  const [variants, setVariants] = useState<VariantWithModel[]>([])
  const [loading, setLoading] = useState(false)
  
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [colorFilter, setColorFilter] = useState('Todas')

  useEffect(() => {
    loadReport()
  }, [statusFilter, searchQuery, colorFilter])

  const loadReport = async () => {
    setLoading(true)
    try {
      const data = await caseService.getReport({
        status: statusFilter,
        search: searchQuery,
        color: colorFilter
      })
      setVariants(data)
    } catch (err) {
      console.error('Erro ao carregar relatório:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = () => {
    if (variants.length === 0) return

    const exportData = variants.map(v => ({
      'Marca': v.models?.brand || '-',
      'Aparelho': v.models?.name || '-',
      'Tipo': v.type,
      'Cor': v.color,
      'Quantidade': v.quantity,
      'Parede': v.models?.wall || '-',
      'Coluna': v.models?.column || '-',
      'Linha': v.models?.row || '-',
      'Código': v.barcode || '-'
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório_Capas')
    
    const dateStr = new Date().toISOString().split('T')[0]
    let filename = `Relatorio_Capas_${dateStr}`
    if (statusFilter === 'zero') filename += '_Zerado'
    if (statusFilter === 'low') filename += '_Baixo'
    
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

  return (
    <div>
      <div className="top-bar">
        <h1 className="top-bar-title"><FiFileText style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} /> Relatórios</h1>
      </div>

      <div className="card" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-md)', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ marginBottom: 'var(--space-sm)', fontSize: '1.1rem', fontWeight: '600' }}>Filtros de Capas</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <div className="search-container" style={{ margin: 0 }}>
            <FiSearch className="search-icon" />
            <input
              className="search-input"
              type="text"
              placeholder="Ex: M55, Preto, Transparente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <select 
              className="form-input" 
              style={{ flex: 1, minWidth: '150px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todas as Situações</option>
              <option value="zero">Estoque Zerado</option>
              <option value="low">Estoque Baixo (&lt; 5)</option>
              <option value="in_stock">Em Estoque (≥ 5)</option>
            </select>

            <select 
              className="form-input" 
              style={{ flex: 1, minWidth: '150px' }}
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
            >
              <option value="Todas">Todas as Cores</option>
              {COLORS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <div className="section-title" style={{ margin: 0 }}>
          {loading ? 'Carregando...' : `${variants.length} capa(s) listadas`}
        </div>
        <button 
          className="btn btn-primary" 
          onClick={exportToExcel}
          disabled={variants.length === 0 || loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: (variants.length === 0 || loading) ? 0.5 : 1 }}
        >
          <FiDownload /> Exportar
        </button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : variants.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">Nenhum dado encontrado</div>
          <p>Ajuste os filtros para ver resultados</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: 'var(--space-sm) 0', minWidth: '130px' }}>Aparelho</th>
                <th style={{ padding: 'var(--space-sm) 0' }}>Capa (Tipo/Cor)</th>
                <th style={{ padding: 'var(--space-sm) 0', textAlign: 'center' }}>Qtd</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--space-md) 0' }}>
                    <div style={{ fontWeight: '600' }}>{v.models?.brand} {v.models?.name}</div>
                    <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      P{v.models?.wall}-C{v.models?.column}-L{v.models?.row}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-md) 0' }}>
                    <div style={{ fontWeight: '500' }}>{v.color}</div>
                    <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>{v.type}</div>
                  </td>
                  <td style={{ padding: 'var(--space-md) 0', textAlign: 'center' }}>
                     <span style={{ 
                      color: v.quantity === 0 ? 'var(--danger)' : v.quantity < 5 ? 'var(--warning)' : 'var(--success)',
                      fontWeight: 'bold',
                      backgroundColor: v.quantity === 0 ? 'rgba(239, 68, 68, 0.1)' : v.quantity < 5 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      padding: '4px 8px',
                      borderRadius: '12px'
                    }}>
                      {v.quantity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
