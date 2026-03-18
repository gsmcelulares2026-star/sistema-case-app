import { supabase } from '../config/supabase'
import { Movement, MovementWithVariant } from '../models/MovementModel'

export const movementService = {
  async registerMovement(variantId: string, type: 'in' | 'out', quantity: number): Promise<Movement> {
    const { data: variant, error: varError } = await supabase
      .from('case_variants')
      .select('quantity')
      .eq('id', variantId)
      .single()
      
    if (varError || !variant) throw new Error('Variação não encontrada')

    const newQuantity = type === 'in'
      ? variant.quantity + quantity
      : variant.quantity - quantity

    if (newQuantity < 0) throw new Error('Quantidade insuficiente em estoque')

    const { data, error } = await supabase
      .from('movements')
      .insert({ variant_id: variantId, type, quantity })
      .select()
      .single()
    if (error) throw error

    const { error: updError } = await supabase
      .from('case_variants')
      .update({ quantity: newQuantity })
      .eq('id', variantId)

    if (updError) throw updError

    return data
  },

  async getByVariantId(variantId: string): Promise<Movement[]> {
    const { data, error } = await supabase
      .from('movements')
      .select('*')
      .eq('variant_id', variantId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return data || []
  },

  async getByModelId(modelId: string): Promise<Movement[]> {
    const { data: variants } = await supabase.from('case_variants').select('id').eq('model_id', modelId)
    if (!variants || variants.length === 0) return []
    
    const variantIds = variants.map(v => v.id)
    
    const { data, error } = await supabase
      .from('movements')
      .select('*, case_variants(type, color)')
      .in('variant_id', variantIds)
      .order('created_at', { ascending: false })
      .limit(50)
      
    if (error) throw error
    return data || []
  },

  async getRecent(limit = 20): Promise<MovementWithVariant[]> {
    const { data, error } = await supabase
      .from('movements')
      .select(`
        *,
        case_variants (
          type, color,
          models (brand, name)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data as any) || []
  },

  async getTopSold(limit = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('movements')
      .select(`
        variant_id, 
        quantity,
        case_variants (
          type, color,
          models (brand, name)
        )
      `)
      .eq('type', 'out')
      
    if (error) throw error

    const aggregated: Record<string, any> = {}
    for (const m of (data || [])) {
      if (!aggregated[m.variant_id]) {
        const variant = m.case_variants as any
        const model = variant?.models
        aggregated[m.variant_id] = {
          variant_id: m.variant_id,
          brand: model?.brand || '',
          name: model?.name || '',
          type: variant?.type || '',
          color: variant?.color || '',
          total: 0
        }
      }
      aggregated[m.variant_id].total += m.quantity
    }

    return Object.values(aggregated)
      .sort((a, b) => b.total - a.total)
      .slice(0, limit)
  }
}
