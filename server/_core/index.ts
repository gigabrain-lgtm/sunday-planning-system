import "dotenv/config";

// Disable TLS certificate validation for Digital Ocean PostgreSQL in production
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('[Server] Disabled TLS certificate validation for PostgreSQL connection');
}
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { runMigrations } from "./migrate";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Run database migrations on startup
  try {
    await runMigrations();
  } catch (error) {
    console.error("[Server] Failed to run migrations, continuing anyway:", error);
  }

  // Run ClickUp clients migration (one-time, safe to run multiple times)
  try {
    console.log('[Server] Running ClickUp clients migration...');
    const { migrateClients } = await import('../migrate-clickup-clients');
    await migrateClients();
    console.log('[Server] ClickUp clients migration completed');
  } catch (error) {
    console.error("[Server] Failed to run ClickUp clients migration:", error);
  }

  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Receipt upload endpoint
  const uploadReceiptRouter = (await import("../upload-receipt")).default;
  app.use("/api", uploadReceiptRouter);
  
  // REST API endpoints for roadmap integration with daily standup
  
  // GET roadmap tasks
  app.get("/api/roadmap/tasks", async (req, res) => {
    try {
      // API key authentication
      const apiKey = req.headers["x-api-key"];
      if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const clickup = await import("../clickup");
      const tasks = await clickup.fetchRoadmapTasks();
      
      res.json({ success: true, tasks });
    } catch (error) {
      console.error("[API] Error fetching roadmap tasks:", error);
      res.status(500).json({ 
        error: "Failed to fetch roadmap tasks",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // POST move task to roadmap
  app.post("/api/roadmap/move", async (req, res) => {
    try {
      // API key authentication
      const apiKey = req.headers["x-api-key"];
      if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { taskId } = req.body;
      if (!taskId) {
        return res.status(400).json({ error: "taskId is required" });
      }

      const { ENV } = await import("./env");
      const clickup = await import("../clickup");
      
      await clickup.moveTaskToList(taskId, ENV.clickupRoadmapListId);
      
      res.json({ success: true, message: "Task moved to roadmap" });
    } catch (error) {
      console.error("[API] Error moving task to roadmap:", error);
      res.status(500).json({ 
        error: "Failed to move task",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Cron endpoints
  app.post("/api/cron/post-visualization", async (req, res) => {
    try {
      // Optional: Add authentication check
      const authToken = req.headers["x-cron-secret"];
      if (process.env.CRON_SECRET && authToken !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { postDailyVisualization } = await import("../cron/post-visualization");
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
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
