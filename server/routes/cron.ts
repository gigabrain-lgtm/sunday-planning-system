/**
 * HTTP endpoint for cron jobs
 * Can be called by Digital Ocean App Platform or external schedulers
 */

import express from "express";
import { postDailyVisualization } from "../cron/post-visualization";

const router = express.Router();

// POST /api/cron/post-visualization
router.post("/post-visualization", async (req, res) => {
  try {
    // Optional: Add authentication check here
    // For example, check for a secret token in headers
    const authToken = req.headers["x-cron-secret"];
    if (authToken !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const result = await postDailyVisualization();
    res.json(result);
  } catch (error) {
    console.error("[Cron API] Error:", error);
    res.status(500).json({ 
      error: "Failed to post visualization",
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
