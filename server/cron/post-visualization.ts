/**
 * Cron job to post visualization to Slack every weekday
 * This endpoint should be called by a scheduler (e.g., Digital Ocean App Platform cron job)
 * Schedule: Every weekday at 8:00 AM
 */

import { getVisualization } from "../db";
import { postVisualizationToSlack } from "../slack";

export async function postDailyVisualization() {
  try {
    // For now, we'll use userId 1 (the main user)
    // In a multi-user system, you'd loop through all users
    const userId = 1;
    
    const visualization = await getVisualization(userId);
    
    if (!visualization) {
      console.log("[Cron] No visualization found for user", userId);
      return { success: false, message: "No visualization found" };
    }
    
    await postVisualizationToSlack(visualization.content);
    
    console.log("[Cron] Successfully posted visualization to Slack");
    return { success: true, message: "Visualization posted to Slack" };
  } catch (error) {
    console.error("[Cron] Error posting visualization:", error);
    throw error;
  }
}
