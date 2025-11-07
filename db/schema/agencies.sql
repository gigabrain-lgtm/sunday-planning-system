CREATE TABLE IF NOT EXISTS agencies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slack_channel_id VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agencies_name ON agencies(name);
CREATE INDEX IF NOT EXISTS idx_agencies_slack_channel ON agencies(slack_channel_id);
