#!/usr/bin/env python3
"""
Eight Sleep Data Fetcher
Fetches sleep session data from Eight Sleep API and stores in PostgreSQL
"""

import os
import sys
import json
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
import asyncio

# Add pyEight import (will be installed via pip)
try:
    from pyeight.eight import EightSleep
except ImportError:
    print("Error: pyeight library not installed. Run: pip3 install pyeight")
    sys.exit(1)


def get_db_connection():
    """Create PostgreSQL connection from DATABASE_URL"""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise Exception("DATABASE_URL environment variable not set")
    
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)


async def fetch_eight_sleep_data():
    """Fetch sleep data from Eight Sleep API"""
    email = os.environ.get('EIGHT_EMAIL')
    password = os.environ.get('EIGHT_PASSWORD')
    timezone = os.environ.get('EIGHT_TIMEZONE', 'America/Sao_Paulo')  # Rio de Janeiro
    
    if not email or not password:
        raise Exception("EIGHT_EMAIL and EIGHT_PASSWORD environment variables required")
    
    print(f"📡 Connecting to Eight Sleep API...")
    print(f"   Email: {email}")
    print(f"   Timezone: {timezone}")
    
    # Initialize Eight Sleep client
    eight = EightSleep(email, password, timezone)
    
    # Authenticate
    await eight.start()
    
    print(f"✅ Connected to Eight Sleep API")
    
    # Get user data
    user = eight.users.get(email)
    if not user:
        raise Exception(f"No user found for email: {email}")
    
    print(f"👤 User: {user.user_profile.get('name', 'Unknown')}")
    
    # Fetch sleep sessions (last 30 days)
    sessions = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    print(f"📅 Fetching sleep sessions from {start_date.date()} to {end_date.date()}...")
    
    # Get intervals (sleep sessions)
    intervals = user.intervals
    
    if not intervals:
        print("⚠️  No sleep sessions found")
        return []
    
    print(f"✅ Found {len(intervals)} sleep sessions")
    
    for interval in intervals:
        try:
            session_data = {
                'session_id': interval.get('id', ''),
                'session_date': datetime.fromtimestamp(interval.get('ts', 0)),
                'sleep_score': interval.get('score', 0),
                'sleep_duration': interval.get('timeseries', {}).get('tnt', [{}])[0].get('duration', 0) // 60,  # Convert to minutes
                'light_sleep_minutes': interval.get('stages', {}).get('light', 0) // 60,
                'deep_sleep_minutes': interval.get('stages', {}).get('deep', 0) // 60,
                'rem_sleep_minutes': interval.get('stages', {}).get('rem', 0) // 60,
                'awake_minutes': interval.get('stages', {}).get('awake', 0) // 60,
                'bedtime_start': datetime.fromtimestamp(interval.get('ts', 0)),
                'bedtime_end': datetime.fromtimestamp(interval.get('ts', 0) + interval.get('duration', 0)),
                'sleep_fitness_score': interval.get('fitness_score', 0),
                'raw_data': json.dumps(interval),
            }
            sessions.append(session_data)
            print(f"   ✓ {session_data['session_date'].date()} - Score: {session_data['sleep_score']}")
        except Exception as e:
            print(f"   ✗ Error parsing session: {e}")
            continue
    
    await eight.stop()
    
    return sessions


def store_sleep_sessions(sessions, user_id=1):
    """Store sleep sessions in PostgreSQL database"""
    if not sessions:
        print("No sessions to store")
        return
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    print(f"\n💾 Storing {len(sessions)} sessions in database...")
    
    new_count = 0
    updated_count = 0
    
    for session in sessions:
        try:
            # Check if session already exists
            cur.execute(
                'SELECT id FROM sleep_sessions WHERE "sessionId" = %s',
                (session['session_id'],)
            )
            existing = cur.fetchone()
            
            if existing:
                # Update existing session
                cur.execute('''
                    UPDATE sleep_sessions SET
                        "sessionDate" = %s,
                        "sleepScore" = %s,
                        "sleepDuration" = %s,
                        "lightSleepMinutes" = %s,
                        "deepSleepMinutes" = %s,
                        "remSleepMinutes" = %s,
                        "awakeMinutes" = %s,
                        "bedtimeStart" = %s,
                        "bedtimeEnd" = %s,
                        "sleepFitnessScore" = %s,
                        "rawData" = %s,
                        "updatedAt" = NOW()
                    WHERE "sessionId" = %s
                ''', (
                    session['session_date'],
                    session['sleep_score'],
                    session['sleep_duration'],
                    session['light_sleep_minutes'],
                    session['deep_sleep_minutes'],
                    session['rem_sleep_minutes'],
                    session['awake_minutes'],
                    session['bedtime_start'],
                    session['bedtime_end'],
                    session['sleep_fitness_score'],
                    session['raw_data'],
                    session['session_id'],
                ))
                updated_count += 1
            else:
                # Insert new session
                cur.execute('''
                    INSERT INTO sleep_sessions (
                        "userId", "sessionId", "sessionDate", "sleepScore", "sleepDuration",
                        "lightSleepMinutes", "deepSleepMinutes", "remSleepMinutes", "awakeMinutes",
                        "bedtimeStart", "bedtimeEnd", "sleepFitnessScore", "rawData"
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ''', (
                    user_id,
                    session['session_id'],
                    session['session_date'],
                    session['sleep_score'],
                    session['sleep_duration'],
                    session['light_sleep_minutes'],
                    session['deep_sleep_minutes'],
                    session['rem_sleep_minutes'],
                    session['awake_minutes'],
                    session['bedtime_start'],
                    session['bedtime_end'],
                    session['sleep_fitness_score'],
                    session['raw_data'],
                ))
                new_count += 1
        except Exception as e:
            print(f"   ✗ Error storing session {session['session_id']}: {e}")
            continue
    
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"\n✅ Import complete!")
    print(f"   New sessions: {new_count}")
    print(f"   Updated sessions: {updated_count}")


async def main():
    """Main execution function"""
    try:
        print("🌙 Eight Sleep Data Fetcher")
        print("=" * 50)
        
        # Fetch data from Eight Sleep API
        sessions = await fetch_eight_sleep_data()
        
        # Store in database
        if sessions:
            store_sleep_sessions(sessions)
        else:
            print("⚠️  No sessions to store")
        
        print("\n✅ Done!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
