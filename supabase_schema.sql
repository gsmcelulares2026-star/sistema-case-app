-- ==========================================
-- Sistema de Gestão de Capas - Schema SQL Relacional
-- ==========================================

-- Tabela de Modelos (Ganchos Físicos)
CREATE TABLE IF NOT EXISTS models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  wall TEXT NOT NULL DEFAULT 'A',
  "column" INTEGER NOT NULL DEFAULT 1,
  "row" INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Variações de Capas
CREATE TABLE IF NOT EXISTS case_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'Silicone',
  color TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 0,
  barcode TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de movimentações
CREATE TABLE IF NOT EXISTS movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id UUID NOT NULL REFERENCES case_variants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('in', 'out')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de perfis (vinculada ao auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_models_name ON models (name);
CREATE INDEX IF NOT EXISTS idx_models_brand ON models (brand);
CREATE INDEX IF NOT EXISTS idx_models_location ON models (wall, "column", "row");
CREATE INDEX IF NOT EXISTS idx_variants_model_id ON case_variants (model_id);
CREATE INDEX IF NOT EXISTS idx_variants_barcode ON case_variants (barcode);
CREATE INDEX IF NOT EXISTS idx_movements_variant_id ON movements (variant_id);
CREATE INDEX IF NOT EXISTS idx_movements_created_at ON movements (created_at);

-- Habilitar RLS
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies: usuários autenticados podem interagir com as tabelas
CREATE POLICY "Auth users can read models" ON models FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert models" ON models FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update models" ON models FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth users can delete models" ON models FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth users can read variants" ON case_variants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert variants" ON case_variants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update variants" ON case_variants FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth users can delete variants" ON case_variants FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth users can read movements" ON movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert movements" ON movements FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Função para criar perfil automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
