export interface PhoneModel {
  id: string
  brand: string
  name: string
  wall: string
  column: number
  row: number
  created_at: string
}

export interface CaseVariant {
  id: string
  model_id: string
  type: string
  color: string
  quantity: number
  barcode: string
  image_url: string
  created_at: string
}

export interface ModelWithVariants extends PhoneModel {
  case_variants: CaseVariant[]
}

export interface ModelFormData {
  brand: string
  name: string
  wall: string
  column: number
  row: number
}

export interface VariantFormData {
  type: string
  color: string
  quantity: number
  barcode: string
  image_url: string
}

export const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Motorola', 'LG', 'Huawei', 'Outro']
export const CASE_TYPES = ['Silicone', 'Anti-impacto', 'Transparente', 'Carteira', 'Capinha com Alça', 'Outro']
export const WALLS = ['A', 'B', 'C']
export const COLORS = [
  'Preto', 'Branco', 'Azul', 'Vermelho', 'Rosa', 'Verde',
  'Amarelo', 'Roxo', 'Laranja', 'Cinza', 'Transparente', 'Outro'
]

export interface VariantWithModel extends CaseVariant {
  models: PhoneModel
}
