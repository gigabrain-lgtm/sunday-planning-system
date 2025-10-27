import { getLatestManifestation } from "../airtable";
import { postDailyManifestationToSlack } from "../slack";

/**
 * Daily cron job to post manifestations to Slack
 * Runs every day at 7:00 AM EST
 */
export async function runDailySlackPost() {
  try {
    console.log("[Cron] Starting daily Slack post...");

    const latestManifestation = await getLatestManifestation();

    if (!latestManifestation) {
      console.warn("[Cron] No manifestation data found, skipping post");
      return;
    }

    await postDailyManifestationToSlack({
      spiritual: latestManifestation["Spiritual Current State"],
      social: latestManifestation["Social Current State"],
      relationship: latestManifestation["Relationship Current State"],
      status: latestManifestation["Status Current State"],
      team: latestManifestation["Team Current State"],
      business: latestManifestation["Business Current State"],
      travel: latestManifestation["Travel Current State"],
      environment: latestManifestation["Environment Current State"],
      family: latestManifestation["Family Current State"],
      skills: latestManifestation["Skills Current State"],
      health: latestManifestation["Health Current State"],
    });

    console.log("[Cron] Daily Slack post completed successfully");
  } catch (error) {
    console.error("[Cron] Failed to post to Slack:", error);
    throw error;
  }
}

// If running directly (for testing)
if (import.meta.url === `file://${process.argv[1]}`) {
  runDailySlackPost()
    .then(() => {
      console.log("Manual run completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Manual run failed:", error);
      process.exit(1);
    });
}

