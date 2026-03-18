import { supabase } from '../config/supabase'
import { PhoneModel, CaseVariant, ModelWithVariants, ModelFormData, VariantFormData, VariantWithModel } from '../models/CaseModel'

export const caseService = {
  async getAllModels(): Promise<ModelWithVariants[]> {
    const { data, error } = await supabase
      .from('models')
      .select('*, case_variants(*)')
      .order('brand', { ascending: true })
      .order('name', { ascending: true })
    if (error) throw error
    return data || []
  },

  async searchModels(query: string): Promise<ModelWithVariants[]> {
    const q = `%${query}%`
    const { data, error } = await supabase
      .from('models')
      .select('*, case_variants(*)')
      .or(`name.ilike.${q},brand.ilike.${q}`)
      .order('brand')
      .order('name')
      .limit(50)
      
    if (error) throw error
    return data || []
  },

  async getModelById(id: string): Promise<ModelWithVariants | null> {
    const { data, error } = await supabase
      .from('models')
      .select('*, case_variants(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async createModelWithVariants(modelData: ModelFormData, variantsData: VariantFormData[]): Promise<ModelWithVariants> {
    const { data: model, error: modelError } = await supabase
      .from('models')
      .insert(modelData)
      .select()
      .single()
    
    if (modelError) throw modelError

    if (variantsData.length > 0) {
      const inserts = variantsData.map(v => ({ ...v, model_id: model.id }))
      const { error: varsError } = await supabase
        .from('case_variants')
        .insert(inserts)
      
      if (varsError) {
        // Rollback strategy theoretically needed, but basic implementation here:
        await supabase.from('models').delete().eq('id', model.id)
        throw varsError
      }
    }

    return this.getModelById(model.id) as Promise<ModelWithVariants>
  },

  async updateModel(id: string, modelData: Partial<ModelFormData>): Promise<PhoneModel> {
    const { data, error } = await supabase
      .from('models')
      .update(modelData)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteModel(id: string): Promise<void> {
    const { error } = await supabase
      .from('models')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async addVariant(modelId: string, variantData: VariantFormData): Promise<CaseVariant> {
    const { data, error } = await supabase
      .from('case_variants')
      .insert({ ...variantData, model_id: modelId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateVariant(id: string, variantData: Partial<VariantFormData>): Promise<CaseVariant> {
    const { data, error } = await supabase
      .from('case_variants')
      .update(variantData)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteVariant(id: string): Promise<void> {
    const { error } = await supabase
      .from('case_variants')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async getModelsByLocation(wall: string, column?: number, row?: number): Promise<ModelWithVariants[]> {
    let query = supabase.from('models').select('*, case_variants(*)').eq('wall', wall)
    if (column !== undefined) query = query.eq('column', column)
    if (row !== undefined) query = query.eq('row', row)
    const { data, error } = await query.order('column').order('row')
    if (error) throw error
    return data || []
  },

  async getByBarcode(barcode: string): Promise<VariantWithModel | null> {
     const { data, error } = await supabase
      .from('case_variants')
      .select('*, models(*)')
      .eq('barcode', barcode)
      .maybeSingle()
    if (error) throw error
    return data as VariantWithModel | null
  },

  async getLowStockVariants(threshold = 5): Promise<VariantWithModel[]> {
    const { data, error } = await supabase
      .from('case_variants')
      .select('*, models(*)')
      .lt('quantity', threshold)
      .order('quantity', { ascending: true })
    if (error) throw error
    return data as VariantWithModel[] || []
  },

  async getReport(filters: { status: string, search: string, color: string }): Promise<VariantWithModel[]> {
    let query = supabase.from('case_variants').select('*, models(*)')
    
    if (filters.status === 'zero') {
      query = query.eq('quantity', 0)
    } else if (filters.status === 'low') {
      query = query.gt('quantity', 0).lt('quantity', 5)
    } else if (filters.status === 'in_stock') {
      query = query.gte('quantity', 5)
    }
    
    if (filters.color && filters.color !== 'Todas') {
      query = query.eq('color', filters.color)
    }
    
    const { data, error } = await query
    if (error) throw error
    
    let result = (data as VariantWithModel[]) || []
    
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      result = result.filter(item => 
        (item.models?.name || '').toLowerCase().includes(q) ||
        (item.models?.brand || '').toLowerCase().includes(q) ||
        (item.barcode || '').toLowerCase().includes(q) ||
        (item.type || '').toLowerCase().includes(q)
      )
    }
    
    return result
  }
}
