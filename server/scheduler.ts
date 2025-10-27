import cron from "node-cron";
import { runDailySlackPost } from "./cron/dailySlackPost";

/**
 * Initialize all scheduled tasks
 * Daily Slack post runs at 7:00 AM EST (12:00 PM UTC in winter, 11:00 AM UTC in summer)
 */
export function initializeScheduler() {
  // Run at 7:00 AM EST every day
  // EST is UTC-5, so 7 AM EST = 12 PM UTC (winter) or 11 AM UTC (summer with DST)
  // Using 11 AM UTC to account for EDT (Eastern Daylight Time)
  const cronExpression = "0 11 * * *"; // 11:00 AM UTC = 7:00 AM EDT

  console.log("[Scheduler] Initializing daily Slack post cron job...");
  console.log("[Scheduler] Schedule: Every day at 7:00 AM EST (11:00 AM UTC)");

  cron.schedule(cronExpression, async () => {
    console.log("[Scheduler] Triggering daily Slack post...");
    try {
      await runDailySlackPost();
    } catch (error) {
      console.error("[Scheduler] Daily Slack post failed:", error);
    }
  });

  console.log("[Scheduler] Cron job initialized successfully");
}

// Manual trigger function for testing
export async function triggerManualSlackPost() {
  console.log("[Scheduler] Manual trigger requested");
  await runDailySlackPost();
}

