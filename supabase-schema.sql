-- =====================================================
-- Schéma de base de données Supabase pour Auradhom
-- =====================================================
-- 
-- Instructions:
-- 1. Allez sur https://supabase.com et créez un nouveau projet
-- 2. Ouvrez l'éditeur SQL dans le tableau de bord Supabase
-- 3. Copiez et exécutez ce script SQL
-- 4. Configurez les politiques RLS (Row Level Security) si nécessaire
-- =====================================================

-- Table: app_config
-- Stocke la configuration de l'application (identifiants admin, numéro WhatsApp)
CREATE TABLE IF NOT EXISTS app_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL DEFAULT 'ProdigeKoumba@admin.com',
  admin_password TEXT NOT NULL DEFAULT 'KP_PRO2026@Admin',
  whatsapp_phone TEXT NOT NULL DEFAULT '242050728339',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: admin_auth
-- Stocke les sessions d'authentification admin
CREATE TABLE IF NOT EXISTS admin_auth (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Table: orders
-- Stocke toutes les commandes (pending, validated, rejected)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'validated', 'rejected')),
  whatsapp_message TEXT,
  phone TEXT,
  validated_at TIMESTAMP WITH TIME ZONE,
  validated_by TEXT,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejected_by TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_auth_user_id ON admin_auth(user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_app_config_updated_at
  BEFORE UPDATE ON app_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insérer la configuration par défaut
INSERT INTO app_config (admin_email, admin_password, whatsapp_phone)
VALUES ('ProdigeKoumba@admin.com', 'KP_PRO2026@Admin', '242050728339')
ON CONFLICT DO NOTHING;

-- =====================================================
-- Politiques RLS (Row Level Security)
-- =====================================================
-- 
-- Activez RLS si vous souhaitez sécuriser l'accès aux données
-- Pour l'instant, nous désactivons RLS pour simplifier
-- Vous pouvez l'activer plus tard avec des politiques personnalisées

-- Activer RLS (optionnel)
-- ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE admin_auth ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Exemple de politique RLS (à adapter selon vos besoins)
-- CREATE POLICY "Enable read access for all users" ON orders
--   FOR SELECT USING (true);
-- 
-- CREATE POLICY "Enable insert access for all users" ON orders
--   FOR INSERT WITH CHECK (true);
-- 
-- CREATE POLICY "Enable update access for all users" ON orders
--   FOR UPDATE USING (true);

