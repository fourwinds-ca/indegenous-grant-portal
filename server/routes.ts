import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Grant routes
  app.get("/api/grants", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const grants = await storage.getAllGrants(limit, offset);
      res.json(grants);
    } catch (error) {
      console.error("Error fetching grants:", error);
      res.status(500).json({ message: "Failed to fetch grants" });
    }
  });

  app.get("/api/grants/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }
      const grants = await storage.searchGrants(query);
      res.json(grants);
    } catch (error) {
      console.error("Error searching grants:", error);
      res.status(500).json({ message: "Failed to search grants" });
    }
  });

  app.get("/api/grants/:id", async (req, res) => {
    try {
      const grant = await storage.getGrant(req.params.id);
      if (!grant) {
        return res.status(404).json({ message: "Grant not found" });
      }
      res.json(grant);
    } catch (error) {
      console.error("Error fetching grant:", error);
      res.status(500).json({ message: "Failed to fetch grant" });
    }
  });

  // User application routes (protected)
  app.get("/api/user/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getUserApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching user applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/user/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applicationData = {
        ...req.body,
        userId,
      };
      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.put("/api/user/applications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applicationId = req.params.id;
      
      // Verify the application belongs to the user
      const existingApplication = await storage.getApplication(applicationId);
      if (!existingApplication || existingApplication.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const application = await storage.updateApplication(applicationId, req.body);
      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // Reporting requirements routes (protected)
  app.get("/api/user/reporting", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requirements = await storage.getUserReportingRequirements(userId);
      res.json(requirements);
    } catch (error) {
      console.error("Error fetching reporting requirements:", error);
      res.status(500).json({ message: "Failed to fetch reporting requirements" });
    }
  });

  // Metrics routes (protected)
  app.get("/api/user/metrics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const metricType = req.query.type as string;
      const metrics = await storage.getUserMetrics(userId, metricType);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching user metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.get("/api/metrics/global", async (req, res) => {
    try {
      const metricType = req.query.type as string;
      const metrics = await storage.getGlobalMetrics(metricType);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching global metrics:", error);
      res.status(500).json({ message: "Failed to fetch global metrics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}