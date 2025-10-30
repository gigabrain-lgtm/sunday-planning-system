/**
 * Eight Sleep API Client
 * 
 * Direct TypeScript implementation of Eight Sleep API
 * Based on reverse-engineering pyEight library
 */

const API_URL = 'https://client-api.8slp.net/v1';

const DEFAULT_HEADERS = {
  'content-type': 'application/json',
  'connection': 'keep-alive',
  'user-agent': 'okhttp/4.9.3',
  'accept-encoding': 'gzip',
  'accept': 'application/json',
};

interface EightSleepSession {
  token: string;
  expirationDate: string;
  userId: string;
}

interface SleepStage {
  stage: 'awake' | 'light' | 'deep' | 'rem';
  duration: number; // seconds
}

interface SleepInterval {
  id: string;
  ts: string; // ISO timestamp
  score: number; // 0-100
  stages?: SleepStage[];
  timeseries?: {
    tnt?: number[][];
    stages?: number[][];
    [key: string]: any;
  };
}

interface SleepTrend {
  day: string; // YYYY-MM-DD
  score: number;
  sleepFitnessScore?: {
    total: number;
    sleepDurationSeconds?: {
      score: number;
      value: number;
    };
    latencyAsleepSeconds?: {
      score: number;
      value: number;
    };
    [key: string]: any;
  };
}

export class EightSleepClient {
  private email: string;
  private password: string;
  private timezone: string;
  private session: EightSleepSession | null = null;

  constructor(email: string, password: string, timezone: string) {
    this.email = email;
    this.password = password;
    this.timezone = timezone;
  }

  /**
   * Check if session token is expired
   */
  private isTokenExpired(): boolean {
    if (!this.session) return true;
    const expirationDate = new Date(this.session.expirationDate);
    const now = new Date();
    // Add 5 minute buffer
    return expirationDate.getTime() - now.getTime() < 5 * 60 * 1000;
  }

  /**
   * Login to Eight Sleep API
   */
  async login(): Promise<void> {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        email: this.email,
        password: this.password,
      }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    this.session = data.session;
  }

  /**
   * Ensure we have a valid session token
   */
  private async ensureAuthenticated(): Promise<void> {
    if (this.isTokenExpired()) {
      await this.login();
    }
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest(
    method: string,
    endpoint: string,
    params?: Record<string, string>,
    body?: any
  ): Promise<any> {
    await this.ensureAuthenticated();

    const url = new URL(`${API_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers = {
      ...DEFAULT_HEADERS,
      'Session-Token': this.session!.token,
    };

    const response = await fetch(url.toString(), {
      method: method.toUpperCase(),
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<any> {
    return await this.apiRequest('GET', '/users/me');
  }

  /**
   * Get user's sleep intervals (sessions)
   */
  async getSleepIntervals(userId: string): Promise<SleepInterval[]> {
    const data = await this.apiRequest('GET', `/users/${userId}/intervals`);
    return data.intervals || [];
  }

  /**
   * Get user's sleep trends for date range
   */
  async getSleepTrends(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<SleepTrend[]> {
    const data = await this.apiRequest('GET', `/users/${userId}/trends`, {
      tz: this.timezone,
      from: startDate,
      to: endDate,
    });
    return data.days || [];
  }

  /**
   * Get sleep data for the past N days
   */
  async getSleepData(days: number = 30): Promise<{
    intervals: SleepInterval[];
    trends: SleepTrend[];
  }> {
    // Get user ID first
    const userData = await this.getCurrentUser();
    const userId = userData.user.userId;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    // Fetch intervals and trends in parallel
    const [intervals, trends] = await Promise.all([
      this.getSleepIntervals(userId),
      this.getSleepTrends(userId, formatDate(startDate), formatDate(endDate)),
    ]);

    return { intervals, trends };
  }

  /**
   * Parse sleep data into simplified format for database storage
   */
  static parseSleepSession(interval: SleepInterval): {
    sessionDate: Date;
    sleepScore: number;
    duration: number;
    lightSleep: number;
    deepSleep: number;
    remSleep: number;
    awakeTime: number;
  } {
    const sessionDate = new Date(interval.ts);
    const sleepScore = interval.score || 0;

    // Calculate durations from stages
    let lightSleep = 0;
    let deepSleep = 0;
    let remSleep = 0;
    let awakeTime = 0;

    if (interval.stages) {
      interval.stages.forEach((stage) => {
        switch (stage.stage) {
          case 'light':
            lightSleep = stage.duration;
            break;
          case 'deep':
            deepSleep = stage.duration;
            break;
          case 'rem':
            remSleep = stage.duration;
            break;
          case 'awake':
            awakeTime = stage.duration;
            break;
        }
      });
    }

    const duration = lightSleep + deepSleep + remSleep;

    return {
      sessionDate,
      sleepScore,
      duration,
      lightSleep,
      deepSleep,
      remSleep,
      awakeTime,
    };
  }
}
