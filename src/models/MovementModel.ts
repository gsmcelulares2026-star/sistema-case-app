export interface Movement {
  id: string
  variant_id: string
  type: 'in' | 'out'
  quantity: number
  created_at: string
}

export interface MovementWithVariant extends Movement {
  case_variants?: {
    type: string
    color: string
    models?: {
      brand: string
      name: string
    }
  }
}
