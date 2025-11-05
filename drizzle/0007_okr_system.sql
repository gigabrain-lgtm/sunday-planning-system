-- Add role-based access tables
CREATE TYPE okr_role AS ENUM ('owner', 'sales', 'bookkeeper');

CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  role okr_role NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Sales team updates
CREATE TABLE IF NOT EXISTS sales_updates (
  id SERIAL PRIMARY KEY,
  week_start_date DATE NOT NULL,
  qualified_leads INTEGER,
  lost_clients INTEGER,
  churn_reason TEXT,
  new_deals INTEGER,
  new_deal_value DECIMAL(10, 2),
  notes TEXT,
  updated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Bookkeeper updates
CREATE TABLE IF NOT EXISTS finance_updates (
  id SERIAL PRIMARY KEY,
  month DATE NOT NULL,
  new_mrr DECIMAL(10, 2),
  churned_mrr DECIMAL(10, 2),
  month_end_close_days INTEGER,
  expense_tracking_coverage DECIMAL(5, 2),
  notes TEXT,
  updated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ClickUp weekly reports (parsed)
CREATE TABLE IF NOT EXISTS clickup_weekly_reports (
  id SERIAL PRIMARY KEY,
  week_start_date DATE NOT NULL,
  total_meetings INTEGER,
  show_rate DECIMAL(5, 2),
  discovery_calls INTEGER,
  second_meetings INTEGER,
  closed_won INTEGER,
  revenue_generated DECIMAL(10, 2),
  pending_revenue DECIMAL(10, 2),
  conversion_discovery_to_second DECIMAL(5, 2),
  conversion_second_to_close DECIMAL(5, 2),
  active_prospects INTEGER,
  raw_report_text TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- OKR progress tracking
CREATE TABLE IF NOT EXISTS okr_progress (
  id SERIAL PRIMARY KEY,
  key_result_id VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  current_value DECIMAL(10, 2),
  target_value DECIMAL(10, 2),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  notes TEXT,
  data_source VARCHAR(50), -- 'manual', 'clickup', 'crm', 'accounting'
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- OKR confidence log
CREATE TABLE IF NOT EXISTS okr_confidence_log (
  id SERIAL PRIMARY KEY,
  key_result_id VARCHAR(255) NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  notes TEXT,
  updated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_updates_week ON sales_updates(week_start_date);
CREATE INDEX IF NOT EXISTS idx_finance_updates_month ON finance_updates(month);
CREATE INDEX IF NOT EXISTS idx_clickup_reports_week ON clickup_weekly_reports(week_start_date);
CREATE INDEX IF NOT EXISTS idx_okr_progress_kr ON okr_progress(key_result_id);
CREATE INDEX IF NOT EXISTS idx_okr_confidence_kr ON okr_confidence_log(key_result_id);
