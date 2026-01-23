import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "../storage";
import { insertRevenueSchema, insertExpenseSchema, insertFundOperationSchema, insertBudgetAllocationSchema, insertBudgetEntrySchema, insertCollectionSchema, insertDisbursementSchema, insertDfurProjectSchema, insertUserSchema, insertViewerCommentSchema } from "../../../shared/schema";
import { hashPassword, comparePassword, sanitizeUser, isAdmin } from "../../auth";
import { z } from "zod";

// Login schema
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      if (user.isActive !== "true") {
        return res.status(403).json({ error: "Account is inactive" });
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Update last login
      await storage.updateLastLogin(user.id);

      // Store user in session
      const sanitized = sanitizeUser(user);
      req.session.userId = user.id;
      req.session.user = sanitized;

      res.json({ user: sanitized });
    } catch (error) {
      res.status(400).json({ error: "Invalid login data" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/session", async (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json({ user: req.session.user });
  });

  app.get("/api/auth/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: sanitizeUser(user) });
  });

  // User management routes (admin/superadmin only)
  app.get("/api/users", async (req, res) => {
    try {
      if (!isAdmin(req.session.user || null)) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const users = await storage.getUsers();
      const sanitized = users.map(sanitizeUser);
      res.json(sanitized);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      if (!isAdmin(req.session.user || null)) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const validated = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existing = await storage.getUserByUsername(validated.username);
      if (existing) {
        return res.status(409).json({ error: "Username already exists" });
      }

      // Hash the password
      const hashedPassword = await hashPassword(validated.password);
      const user = await storage.createUser({
        ...validated,
        password: hashedPassword,
      });

      res.status(201).json(sanitizeUser(user));
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      if (!isAdmin(req.session.user || null)) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const updates = req.body;
      
      // If password is being updated, hash it
      if (updates.password) {
        updates.password = await hashPassword(updates.password);
      }

      const user = await storage.updateUser(req.params.id, updates);
      res.json(sanitizeUser(user));
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      if (!isAdmin(req.session.user || null)) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Prevent deleting yourself
      if (req.session.userId === req.params.id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }

      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Revenue routes
  app.get("/api/revenues", async (_req, res) => {
    try {
      const revenues = await storage.getRevenues();
      res.json(revenues);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch revenues" });
    }
  });

  app.get("/api/revenues/:id", async (req, res) => {
    try {
      const revenue = await storage.getRevenue(req.params.id);
      if (!revenue) {
        return res.status(404).json({ error: "Revenue not found" });
      }
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch revenue" });
    }
  });

  app.post("/api/revenues", async (req, res) => {
    try {
      const validated = insertRevenueSchema.parse(req.body);
      const revenue = await storage.createRevenue(validated);
      res.status(201).json(revenue);
    } catch (error) {
      res.status(400).json({ error: "Invalid revenue data" });
    }
  });

  // Expense routes
  app.get("/api/expenses", async (_req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const expense = await storage.getExpense(req.params.id);
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const validated = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validated);
      res.status(201).json(expense);
    } catch (error) {
      res.status(400).json({ error: "Invalid expense data" });
    }
  });

  // Fund operations routes
  app.get("/api/fund-operations", async (_req, res) => {
    try {
      const operations = await storage.getFundOperations();
      res.json(operations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fund operations" });
    }
  });

  app.get("/api/fund-operations/:id", async (req, res) => {
    try {
      const operation = await storage.getFundOperation(req.params.id);
      if (!operation) {
        return res.status(404).json({ error: "Fund operation not found" });
      }
      res.json(operation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fund operation" });
    }
  });

  app.post("/api/fund-operations", async (req, res) => {
    try {
      const validated = insertFundOperationSchema.parse(req.body);
      const operation = await storage.createFundOperation(validated);
      res.status(201).json(operation);
    } catch (error) {
      res.status(400).json({ error: "Invalid fund operation data" });
    }
  });

  // Budget allocation routes
  app.get("/api/budget-allocations", async (_req, res) => {
    try {
      const allocations = await storage.getBudgetAllocations();
      res.json(allocations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch budget allocations" });
    }
  });

  app.post("/api/budget-allocations", async (req, res) => {
    try {
      const validated = insertBudgetAllocationSchema.parse(req.body);
      const allocation = await storage.createBudgetAllocation(validated);
      res.status(201).json(allocation);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget allocation data" });
    }
  });

  // Budget entry (ABO) routes
  app.get("/api/budget-entries", async (_req, res) => {
    try {
      const entries = await storage.getBudgetEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch budget entries" });
    }
  });

  app.get("/api/budget-entries/generate-id", async (_req, res) => {
    try {
      const transactionId = await storage.generateBudgetEntryTransactionId();
      res.json({ transactionId });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate transaction ID" });
    }
  });

  app.get("/api/budget-entries/:id", async (req, res) => {
    try {
      const entry = await storage.getBudgetEntry(req.params.id);
      if (!entry) {
        return res.status(404).json({ error: "Budget entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch budget entry" });
    }
  });

  app.post("/api/budget-entries", async (req, res) => {
    try {
      const validated = insertBudgetEntrySchema.parse(req.body);
      const entry = await storage.createBudgetEntry(validated);
      res.status(201).json(entry);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget entry data", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.patch("/api/budget-entries/:id", async (req, res) => {
    try {
      const validated = insertBudgetEntrySchema.partial().parse(req.body);
      const entry = await storage.updateBudgetEntry(req.params.id, validated);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget entry data", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete("/api/budget-entries/:id", async (req, res) => {
    try {
      await storage.deleteBudgetEntry(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete budget entry" });
    }
  });

  // Collection routes
  app.get("/api/collections", async (_req, res) => {
    try {
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collections" });
    }
  });

  app.get("/api/collections/generate-id", async (_req, res) => {
    try {
      const transactionId = await storage.generateCollectionTransactionId();
      res.json({ transactionId });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate transaction ID" });
    }
  });

  app.get("/api/collections/:id", async (req, res) => {
    try {
      const collection = await storage.getCollection(req.params.id);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collection" });
    }
  });

  app.post("/api/collections", async (req, res) => {
    try {
      console.log("Collection POST request body:", JSON.stringify(req.body, null, 2));
      const validated = insertCollectionSchema.parse(req.body);
      const collection = await storage.createCollection(validated);
      res.status(201).json(collection);
    } catch (error) {
      console.error("Collection validation error:", error);
      res.status(400).json({ error: "Invalid collection data", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.patch("/api/collections/:id", async (req, res) => {
    try {
      // For updates, we pass the partial data directly without strict validation
      const collection = await storage.updateCollection(req.params.id, req.body);
      res.json(collection);
    } catch (error) {
      res.status(400).json({ error: "Invalid collection data", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete("/api/collections/:id", async (req, res) => {
    try {
      await storage.deleteCollection(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete collection" });
    }
  });

  // Review collection endpoint
  app.patch("/api/collections/:id/review", async (req, res) => {
    try {
      const { status, comment, reviewedBy } = req.body;
      
      if (!status || (status !== "approved" && status !== "flagged")) {
        return res.status(400).json({ error: "Invalid review status. Must be 'approved' or 'flagged'" });
      }
      
      const collection = await storage.reviewCollection(req.params.id, status, comment, reviewedBy);
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: "Failed to review collection", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Disbursement routes
  app.get("/api/disbursements", async (_req, res) => {
    try {
      const disbursements = await storage.getDisbursements();
      res.json(disbursements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch disbursements" });
    }
  });

  app.get("/api/disbursements/generate-id", async (_req, res) => {
    try {
      const transactionId = await storage.generateDisbursementTransactionId();
      res.json({ transactionId });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate transaction ID" });
    }
  });

  app.get("/api/disbursements/:id", async (req, res) => {
    try {
      const disbursement = await storage.getDisbursement(req.params.id);
      if (!disbursement) {
        return res.status(404).json({ error: "Disbursement not found" });
      }
      res.json(disbursement);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch disbursement" });
    }
  });

  app.post("/api/disbursements", async (req, res) => {
    try {
      const validated = insertDisbursementSchema.parse(req.body);
      const disbursement = await storage.createDisbursement(validated);
      res.status(201).json(disbursement);
    } catch (error) {
      res.status(400).json({ error: "Invalid disbursement data" });
    }
  });

  app.patch("/api/disbursements/:id", async (req, res) => {
    try {
      // For updates, we pass the partial data directly without strict validation
      const disbursement = await storage.updateDisbursement(req.params.id, req.body);
      res.json(disbursement);
    } catch (error) {
      res.status(400).json({ error: "Invalid disbursement data", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete("/api/disbursements/:id", async (req, res) => {
    try {
      await storage.deleteDisbursement(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete disbursement" });
    }
  });

  // Review disbursement endpoint
  app.patch("/api/disbursements/:id/review", async (req, res) => {
    try {
      const { status, comment, reviewedBy } = req.body;
      
      if (!status || (status !== "approved" && status !== "flagged")) {
        return res.status(400).json({ error: "Invalid review status. Must be 'approved' or 'flagged'" });
      }
      
      const disbursement = await storage.reviewDisbursement(req.params.id, status, comment, reviewedBy);
      res.json(disbursement);
    } catch (error) {
      res.status(500).json({ error: "Failed to review disbursement", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // DFUR routes
  app.get("/api/dfur", async (_req, res) => {
    try {
      const projects = await storage.getDfurProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch DFUR projects" });
    }
  });

  app.get("/api/dfur/generate-id", async (_req, res) => {
    try {
      const transactionId = await storage.generateDfurTransactionId();
      res.json({ transactionId });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate transaction ID" });
    }
  });

  app.get("/api/dfur/:id", async (req, res) => {
    try {
      const project = await storage.getDfurProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "DFUR project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch DFUR project" });
    }
  });

  app.post("/api/dfur", async (req, res) => {
    try {
      const validated = insertDfurProjectSchema.parse(req.body);
      const project = await storage.createDfurProject(validated);
      res.status(201).json(project);
    } catch (error) {
      console.error("DFUR validation error:", error);
      res.status(400).json({ error: "Invalid DFUR project data", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.patch("/api/dfur/:id", async (req, res) => {
    try {
      // For updates, we don't validate with the schema since it has refinements
      // that require all fields. Instead, we pass the partial data directly.
      const project = await storage.updateDfurProject(req.params.id, req.body);
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid DFUR project data", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete("/api/dfur/:id", async (req, res) => {
    try {
      await storage.deleteDfurProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete DFUR project" });
    }
  });

  // Review DFUR project endpoint
  app.patch("/api/dfur/:id/review", async (req, res) => {
    try {
      const { status, comment, reviewedBy } = req.body;
      
      if (!status || (status !== "approved" && status !== "flagged")) {
        return res.status(400).json({ error: "Invalid review status. Must be 'approved' or 'flagged'" });
      }
      
      const project = await storage.reviewDfurProject(req.params.id, status, comment, reviewedBy);
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to review DFUR project", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Analytics routes
  app.get("/api/financial-summary", async (_req, res) => {
    try {
      const summary = await storage.getFinancialSummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch financial summary" });
    }
  });

  app.get("/api/monthly-data", async (_req, res) => {
    try {
      const data = await storage.getMonthlyData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monthly data" });
    }
  });

  app.get("/api/revenue-by-category", async (_req, res) => {
    try {
      const data = await storage.getRevenueByCategory();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch revenue by category" });
    }
  });

  app.get("/api/expense-by-category", async (_req, res) => {
    try {
      const data = await storage.getExpenseByCategory();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense by category" });
    }
  });

  // Activity Log - Recent transactions across all modules
  app.get("/api/activity-log", async (req, res) => {
    try {
      if (!isAdmin(req.session.user || null)) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const activities = await storage.getActivityLog(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activity log" });
    }
  });

  // ABR - Annual Budget Report
  app.get("/api/abr/capital-outlay-summary", async (req, res) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      const summary = await storage.getCapitalOutlaySummary(year);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch capital outlay summary" });
    }
  });

  // Viewer Comments - Public can submit, Admin can view/moderate
  app.post("/api/viewer-comments", async (req, res) => {
    try {
      const validated = insertViewerCommentSchema.parse(req.body);
      const comment = await storage.createViewerComment(validated);
      res.status(201).json({ success: true, id: comment.id });
    } catch (error) {
      res.status(400).json({ error: "Invalid comment data" });
    }
  });

  app.get("/api/viewer-comments", async (req, res) => {
    try {
      if (!isAdmin(req.session.user || null)) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const status = req.query.status as string | undefined;
      const comments = await storage.getViewerComments(status);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching viewer comments:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.patch("/api/viewer-comments/:id/status", async (req, res) => {
    try {
      if (!isAdmin(req.session.user || null)) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const { id } = req.params;
      
      // Validate status with Zod
      const statusSchema = z.object({
        status: z.enum(["pending", "published", "archived"]),
      });
      
      const validated = statusSchema.parse(req.body);
      
      const updated = await storage.updateCommentStatus(
        id,
        validated.status,
        req.session.user?.fullName || req.session.user?.username
      );
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      console.error("Error updating comment status:", error);
      res.status(500).json({ error: "Failed to update comment status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
