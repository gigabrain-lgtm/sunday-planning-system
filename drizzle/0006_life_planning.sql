-- Life Planning System Tables

-- Habit Categories
CREATE TABLE IF NOT EXISTS habit_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER NOT NULL
);

-- Insert default categories
INSERT INTO habit_categories (name, color, icon, sort_order) VALUES
  ('Physical', '#93C5FD', '💪', 1),
  ('Mental', '#FCA5A5', '🧠', 2),
  ('Business & Energy', '#86EFAC', '⚡', 3),
  ('Masculine Presence', '#FDE047', '👔', 4),
  ('Social', '#C4B5FD', '👥', 5),
  ('Spiritual', '#FDBA74', '🙏', 6);

-- Life Missions
CREATE TABLE IF NOT EXISTS life_missions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  title TEXT NOT NULL,
  mission_statements JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Habits
CREATE TABLE IF NOT EXISTS habits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES habit_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  target_value INTEGER,
  unit TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Habit Completions
CREATE TABLE IF NOT EXISTS habit_completions (
  id SERIAL PRIMARY KEY,
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  value INTEGER,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);

-- Quests
CREATE TABLE IF NOT EXISTS quests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  quest_type TEXT NOT NULL CHECK (quest_type IN ('weekly', 'monthly', 'specific_monthly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Daily Reflections
CREATE TABLE IF NOT EXISTS daily_reflections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reflection_date DATE NOT NULL,
  daily_intention TEXT,
  free_journal TEXT,
  one_thing_grateful TEXT,
  one_thing_learned TEXT,
  sleep_time TEXT,
  wake_time TEXT,
  unscheduled_screen_time INTEGER,
  recovery_focus TEXT,
  calendar_audited BOOLEAN,
  diet_score INTEGER CHECK (diet_score >= 1 AND diet_score <= 10),
  big_3_or_small_food TEXT,
  promises_honored BOOLEAN,
  tmrws_intention TEXT,
  clothes_laid_out BOOLEAN,
  phone_on_charge BOOLEAN,
  biggest_vice TEXT,
  personal_constraint TEXT,
  on_track_projections BOOLEAN,
  new_cash DECIMAL(10, 2),
  cash_in_bank DECIMAL(10, 2),
  input_percentage INTEGER CHECK (input_percentage >= 0 AND input_percentage <= 100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, reflection_date)
);

-- Gamification Profile
CREATE TABLE IF NOT EXISTS gamification_profile (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  current_xp INTEGER NOT NULL DEFAULT 0,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  impulse_points INTEGER NOT NULL DEFAULT 0,
  total_habits_completed INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- XP Transactions
CREATE TABLE IF NOT EXISTS xp_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('habit_completion', 'quest_completion', 'streak_bonus', 'manual')),
  source_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Life Visualizations
CREATE TABLE IF NOT EXISTS life_visualizations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visualization_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  data JSONB,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_date ON habit_completions(user_id, completed_date);
CREATE INDEX IF NOT EXISTS idx_quests_user_dates ON quests(user_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date ON daily_reflections(user_id, reflection_date);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON xp_transactions(user_id, created_at DESC);
