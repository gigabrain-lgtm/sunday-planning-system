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
      spiritual: latestManifestation["Spiritual Reflection"],
      social: latestManifestation["Social Reflection"],
      relationship: latestManifestation["Relationship Reflection"],
      status: latestManifestation["Status Reflection"],
      team: latestManifestation["Team Reflection"],
      business: latestManifestation["Business Reflection"],
      travel: latestManifestation["Travel Reflection"],
      environment: latestManifestation["Environment Reflection"],
      family: latestManifestation["Family Reflection"],
      skills: latestManifestation["Skills Reflection"],
      health: latestManifestation["Health Reflection"],
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

