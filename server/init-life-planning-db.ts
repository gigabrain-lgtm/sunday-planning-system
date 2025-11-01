import { db } from "./db";
import { sql } from "drizzle-orm";

export async function initLifePlanningTables() {
  try {
    console.log("Creating Life Planning tables...");

    // Create habit_categories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS habit_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        color VARCHAR(7),
        icon VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create life_mission table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS life_mission (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        year INTEGER NOT NULL,
        mission_statement TEXT,
        core_values JSONB,
        level INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, year)
      )
    `);

    // Create habits table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS habits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        category_id INTEGER REFERENCES habit_categories(id),
        name VARCHAR(200) NOT NULL,
        description TEXT,
        frequency VARCHAR(50) DEFAULT 'daily',
        target_value INTEGER,
        unit VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create habit_completions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS habit_completions (
        id SERIAL PRIMARY KEY,
        habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        completion_date DATE NOT NULL,
        completed BOOLEAN DEFAULT true,
        actual_value INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(habit_id, user_id, completion_date)
      )
    `);

    // Create quests table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS quests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        quest_type VARCHAR(50) DEFAULT 'weekly',
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create daily_reflections table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS daily_reflections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        reflection_date DATE NOT NULL,
        daily_intention TEXT,
        free_journal TEXT,
        one_thing_grateful TEXT,
        one_thing_learned TEXT,
        sleep_time TIME,
        wake_time TIME,
        diet_score INTEGER,
        promises_honored BOOLEAN,
        calendar_audited BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, reflection_date)
      )
    `);

    // Create gamification_profile table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS gamification_profile (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
        level INTEGER DEFAULT 1,
        current_xp INTEGER DEFAULT 0,
        total_xp INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_activity_date DATE,
        impulse_points INTEGER DEFAULT 0,
        habits_completed INTEGER DEFAULT 0,
        quests_completed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create xp_history table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS xp_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        amount INTEGER NOT NULL,
        source VARCHAR(100),
        description TEXT,
        habit_id INTEGER REFERENCES habits(id),
        quest_id INTEGER REFERENCES quests(id),
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create life_visualizations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS life_visualizations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        visualization_type VARCHAR(100),
        data JSONB,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default habit categories
    await db.execute(sql`
      INSERT INTO habit_categories (name, description, color, icon) VALUES
        ('Physical', 'Physical health and fitness', '#3B82F6', '💪'),
        ('Mental', 'Mental clarity and emotional wellbeing', '#EC4899', '🧠'),
        ('Business and Energy', 'Work performance and energy management', '#10B981', '⚡'),
        ('Masculine Presence', 'Leadership and confidence', '#F59E0B', '👑'),
        ('Social', 'Relationships and social connections', '#8B5CF6', '🤝'),
        ('Spiritual', 'Spiritual growth and mindfulness', '#F97316', '🙏')
      ON CONFLICT DO NOTHING
    `);

    console.log("✅ Life Planning tables created successfully!");
    return { success: true, message: "Life Planning tables created successfully" };
  } catch (error) {
    console.error("❌ Error creating Life Planning tables:", error);
    throw error;
  }
}
