-- Migration: Unified Standup System
-- Adds daily standup, weekly check-in/checkout, and blocker tracking to Sunday Planning System

-- Add standup preferences to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS standup_time TIME DEFAULT '09:00:00';
ALTER TABLE users ADD COLUMN IF NOT EXISTS standup_timezone VARCHAR(50) DEFAULT 'America/New_York';
ALTER TABLE users ADD COLUMN IF NOT EXISTS standup_notification_method VARCHAR(20) DEFAULT 'slack';
ALTER TABLE users ADD COLUMN IF NOT EXISTS standup_reminder_days VARCHAR(50) DEFAULT 'weekdays';

-- Daily Standup Submissions
CREATE TABLE IF NOT EXISTS daily_standups (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  standup_date DATE NOT NULL,
  task_ids TEXT[] NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_standup_date UNIQUE(user_id, standup_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_standups_user_date ON daily_standups(user_id, standup_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_standups_date ON daily_standups(standup_date DESC);

-- Task Blockers/Bottlenecks
CREATE TABLE IF NOT EXISTS task_blockers (
  id SERIAL PRIMARY KEY,
  task_id VARCHAR(255) NOT NULL,
  task_name TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocker_type VARCHAR(50),
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMP,
  resolved_by INTEGER REFERENCES users(id),
  resolution_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_task_blockers_task ON task_blockers(task_id);
CREATE INDEX IF NOT EXISTS idx_task_blockers_user ON task_blockers(user_id);
CREATE INDEX IF NOT EXISTS idx_task_blockers_status ON task_blockers(status) WHERE status != 'resolved';

-- Weekly Check-in/Checkout Submissions
CREATE TABLE IF NOT EXISTS weekly_submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submission_type VARCHAR(20) NOT NULL CHECK (submission_type IN ('checkin', 'checkout')),
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW() NOT NULL,
  slack_message_ts TEXT,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  in_progress_tasks INTEGER DEFAULT 0,
  new_tasks INTEGER DEFAULT 0,
  flagged_tasks INTEGER DEFAULT 0,
  task_data JSONB,
  notes TEXT,
  CONSTRAINT unique_user_submission_week UNIQUE(user_id, submission_type, week_number, year)
);

CREATE INDEX IF NOT EXISTS idx_weekly_submissions_user ON weekly_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_submissions_week ON weekly_submissions(week_number, year);
CREATE INDEX IF NOT EXISTS idx_weekly_submissions_type ON weekly_submissions(submission_type);

-- Reminder Tracking (prevents duplicate sends)
CREATE TABLE IF NOT EXISTS reminder_log (
  id SERIAL PRIMARY KEY,
  reminder_type VARCHAR(50) NOT NULL,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW() NOT NULL,
  recipient_count INTEGER DEFAULT 0,
  CONSTRAINT unique_reminder_week UNIQUE(reminder_type, week_number, year)
);

CREATE INDEX IF NOT EXISTS idx_reminder_log_type_week ON reminder_log(reminder_type, week_number, year);

-- Standup Completion Tracking (for analytics)
CREATE TABLE IF NOT EXISTS standup_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  standups_completed INTEGER DEFAULT 0,
  standups_expected INTEGER DEFAULT 5, -- weekdays
  completion_rate DECIMAL(5,2),
  avg_tasks_per_standup DECIMAL(5,2),
  total_blockers_reported INTEGER DEFAULT 0,
  CONSTRAINT unique_user_week_stats UNIQUE(user_id, week_number, year)
);

CREATE INDEX IF NOT EXISTS idx_standup_stats_user_week ON standup_stats(user_id, week_number, year);

-- Function to update standup stats automatically
CREATE OR REPLACE FUNCTION update_standup_stats()
RETURNS TRIGGER AS $$
DECLARE
  week_num INTEGER;
  week_year INTEGER;
BEGIN
  week_num := EXTRACT(WEEK FROM NEW.standup_date);
  week_year := EXTRACT(YEAR FROM NEW.standup_date);
  
  INSERT INTO standup_stats (user_id, week_number, year, standups_completed, avg_tasks_per_standup)
  VALUES (
    NEW.user_id,
    week_num,
    week_year,
    1,
    COALESCE(array_length(NEW.task_ids, 1), 0)
  )
  ON CONFLICT (user_id, week_number, year)
  DO UPDATE SET
    standups_completed = standup_stats.standups_completed + 1,
    avg_tasks_per_standup = (
      (standup_stats.avg_tasks_per_standup * standup_stats.standups_completed + COALESCE(array_length(NEW.task_ids, 1), 0)) 
      / (standup_stats.standups_completed + 1)
    ),
    completion_rate = (
      ((standup_stats.standups_completed + 1)::DECIMAL / standup_stats.standups_expected) * 100
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update stats
DROP TRIGGER IF EXISTS trigger_update_standup_stats ON daily_standups;
CREATE TRIGGER trigger_update_standup_stats
  AFTER INSERT ON daily_standups
  FOR EACH ROW
  EXECUTE FUNCTION update_standup_stats();

-- Function to update blocker count in stats
CREATE OR REPLACE FUNCTION update_blocker_stats()
RETURNS TRIGGER AS $$
DECLARE
  week_num INTEGER;
  week_year INTEGER;
BEGIN
  week_num := EXTRACT(WEEK FROM NEW.created_at);
  week_year := EXTRACT(YEAR FROM NEW.created_at);
  
  UPDATE standup_stats
  SET total_blockers_reported = total_blockers_reported + 1
  WHERE user_id = NEW.user_id
    AND week_number = week_num
    AND year = week_year;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update blocker stats
DROP TRIGGER IF EXISTS trigger_update_blocker_stats ON task_blockers;
CREATE TRIGGER trigger_update_blocker_stats
  AFTER INSERT ON task_blockers
  FOR EACH ROW
  EXECUTE FUNCTION update_blocker_stats();

-- Comments for documentation
COMMENT ON TABLE daily_standups IS 'Daily standup task selections - tracks which tasks users commit to each day';
COMMENT ON TABLE task_blockers IS 'Task blockers and bottlenecks reported during standups';
COMMENT ON TABLE weekly_submissions IS 'Weekly check-in and checkout submissions with aggregated task metrics';
COMMENT ON TABLE reminder_log IS 'Tracks sent reminders to prevent duplicates';
COMMENT ON TABLE standup_stats IS 'Weekly standup completion analytics per user';
