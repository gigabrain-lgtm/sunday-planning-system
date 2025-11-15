-- Insert sample ClickUp clients for testing
INSERT INTO clickup_clients (
  id, name, brand, company, mrp_seller, status, defcon, notes, created_at, updated_at
) VALUES
  ('client_001', 'Acme Corp', 'Acme Brand', 'Acme Corporation', 'Acme Seller', 'active', 1, 'High priority client', NOW(), NOW()),
  ('client_002', 'TechGear Inc', 'TechGear', 'TechGear Incorporated', 'TechGear MRP', 'active', 2, 'Medium priority', NOW(), NOW()),
  ('client_003', 'HomeGoods LLC', 'HomeGoods', 'HomeGoods Limited', 'HomeGoods Seller', 'active', 3, 'Standard client', NOW(), NOW()),
  ('client_004', 'FitnessPro', 'FitnessPro Brand', 'FitnessPro Company', 'FitnessPro MRP', 'paused', 2, 'Temporarily paused', NOW(), NOW()),
  ('client_005', 'BeautyBox', 'BeautyBox', 'BeautyBox International', 'BeautyBox Seller', 'active', 1, 'VIP client', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  company = EXCLUDED.company,
  mrp_seller = EXCLUDED.mrp_seller,
  status = EXCLUDED.status,
  defcon = EXCLUDED.defcon,
  notes = EXCLUDED.notes,
  updated_at = NOW();
