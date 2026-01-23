import { 
  type Revenue, 
  type InsertRevenue, 
  type Expense, 
  type InsertExpense,
  type FundOperation,
  type InsertFundOperation,
  type BudgetAllocation,
  type InsertBudgetAllocation,
  type BudgetEntry,
  type InsertBudgetEntry,
  type Collection,
  type InsertCollection,
  type Disbursement,
  type InsertDisbursement,
  type DfurProject,
  type InsertDfurProject,
  type User,
  type InsertUser,
  type UserWithoutPassword,
  type ViewerComment,
  type InsertViewerComment,
  type FinancialSummary,
  type MonthlyData,
  type CategoryData,
  revenues,
  expenses,
  fundOperations,
  budgetAllocations,
  budgetEntries,
  collections,
  disbursements,
  dfurProjects,
  users,
  viewerComments,
} from "../../shared/schema";
import { type CapitalOutlaySummary } from "../../shared/abr";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, like } from "drizzle-orm";

// Activity Log interface
export interface ActivityLog {
  id: string;
  transactionId: string;
  type: "collection" | "disbursement" | "dfur" | "budget_entry";
  date: Date;
  description: string;
  amount: string;
  category: string;
  status: string;
  createdAt?: Date;
}

export interface IStorage {
  // Revenue operations
  getRevenues(): Promise<Revenue[]>;
  getRevenue(id: string): Promise<Revenue | undefined>;
  createRevenue(revenue: InsertRevenue): Promise<Revenue>;
  
  // Expense operations
  getExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  
  // Fund operations
  getFundOperations(): Promise<FundOperation[]>;
  getFundOperation(id: string): Promise<FundOperation | undefined>;
  createFundOperation(operation: InsertFundOperation): Promise<FundOperation>;
  
  // Budget allocations
  getBudgetAllocations(): Promise<BudgetAllocation[]>;
  createBudgetAllocation(allocation: InsertBudgetAllocation): Promise<BudgetAllocation>;
  
  // Budget entries (ABO)
  getBudgetEntries(): Promise<BudgetEntry[]>;
  getBudgetEntry(id: string): Promise<BudgetEntry | undefined>;
  createBudgetEntry(entry: InsertBudgetEntry): Promise<BudgetEntry>;
  updateBudgetEntry(id: string, entry: Partial<InsertBudgetEntry>): Promise<BudgetEntry>;
  deleteBudgetEntry(id: string): Promise<void>;
  generateBudgetEntryTransactionId(): Promise<string>;
  
  // Collection operations
  getCollections(): Promise<Collection[]>;
  getCollection(id: string): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: string, collection: Partial<InsertCollection>): Promise<Collection>;
  deleteCollection(id: string): Promise<void>;
  generateCollectionTransactionId(): Promise<string>;
  reviewCollection(id: string, status: "approved" | "flagged", comment?: string, reviewedBy?: string): Promise<Collection>;
  
  // Disbursement operations
  getDisbursements(): Promise<Disbursement[]>;
  getDisbursement(id: string): Promise<Disbursement | undefined>;
  createDisbursement(disbursement: InsertDisbursement): Promise<Disbursement>;
  updateDisbursement(id: string, disbursement: Partial<InsertDisbursement>): Promise<Disbursement>;
  deleteDisbursement(id: string): Promise<void>;
  generateDisbursementTransactionId(): Promise<string>;
  reviewDisbursement(id: string, status: "approved" | "flagged", comment?: string, reviewedBy?: string): Promise<Disbursement>;
  
  // DFUR operations
  getDfurProjects(): Promise<DfurProject[]>;
  getDfurProject(id: string): Promise<DfurProject | undefined>;
  createDfurProject(project: InsertDfurProject): Promise<DfurProject>;
  updateDfurProject(id: string, project: Partial<InsertDfurProject>): Promise<DfurProject>;
  deleteDfurProject(id: string): Promise<void>;
  generateDfurTransactionId(): Promise<string>;
  reviewDfurProject(id: string, status: "approved" | "flagged", comment?: string, reviewedBy?: string): Promise<DfurProject>;
  
  // Analytics
  getFinancialSummary(): Promise<FinancialSummary>;
  getMonthlyData(): Promise<MonthlyData[]>;
  getRevenueByCategory(): Promise<CategoryData[]>;
  getExpenseByCategory(): Promise<CategoryData[]>;
  
  // ABR - Annual Budget Report
  getCapitalOutlaySummary(year: number): Promise<CapitalOutlaySummary>;
  
  // Activity Log
  getActivityLog(limit?: number): Promise<ActivityLog[]>;
  
  // Viewer Comments
  createViewerComment(comment: InsertViewerComment): Promise<ViewerComment>;
  getViewerComments(status?: string): Promise<ViewerComment[]>;
  updateCommentStatus(id: string, status: string, reviewedBy?: string): Promise<ViewerComment>;
  
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<Omit<InsertUser, 'username'>>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  updateLastLogin(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Revenue operations
  async getRevenues(): Promise<Revenue[]> {
    return await db.select().from(revenues).orderBy(desc(revenues.date));
  }

  async getRevenue(id: string): Promise<Revenue | undefined> {
    const [revenue] = await db.select().from(revenues).where(eq(revenues.id, id));
    return revenue || undefined;
  }

  async createRevenue(insertRevenue: InsertRevenue): Promise<Revenue> {
    const [revenue] = await db
      .insert(revenues)
      .values(insertRevenue)
      .returning();
    return revenue;
  }

  // Expense operations
  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(desc(expenses.date));
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense || undefined;
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values(insertExpense)
      .returning();
    return expense;
  }

  // Fund operations
  async getFundOperations(): Promise<FundOperation[]> {
    return await db.select().from(fundOperations).orderBy(desc(fundOperations.date));
  }

  async getFundOperation(id: string): Promise<FundOperation | undefined> {
    const [operation] = await db.select().from(fundOperations).where(eq(fundOperations.id, id));
    return operation || undefined;
  }

  async createFundOperation(insertOperation: InsertFundOperation): Promise<FundOperation> {
    const [operation] = await db
      .insert(fundOperations)
      .values(insertOperation)
      .returning();
    return operation;
  }

  // Budget allocations
  async getBudgetAllocations(): Promise<BudgetAllocation[]> {
    return await db.select().from(budgetAllocations);
  }

  async createBudgetAllocation(insertAllocation: InsertBudgetAllocation): Promise<BudgetAllocation> {
    const [allocation] = await db
      .insert(budgetAllocations)
      .values(insertAllocation)
      .returning();
    return allocation;
  }

  // Budget entries (ABO) operations
  async getBudgetEntries(): Promise<BudgetEntry[]> {
    return await db.select().from(budgetEntries).orderBy(desc(budgetEntries.transactionDate));
  }

  async getBudgetEntry(id: string): Promise<BudgetEntry | undefined> {
    const [entry] = await db.select().from(budgetEntries).where(eq(budgetEntries.id, id));
    return entry || undefined;
  }

  async createBudgetEntry(insertEntry: InsertBudgetEntry): Promise<BudgetEntry> {
    const [entry] = await db
      .insert(budgetEntries)
      .values(insertEntry)
      .returning();
    return entry;
  }

  async updateBudgetEntry(id: string, updateData: Partial<InsertBudgetEntry>): Promise<BudgetEntry> {
    const [entry] = await db
      .update(budgetEntries)
      .set(updateData)
      .where(eq(budgetEntries.id, id))
      .returning();
    return entry;
  }

  async deleteBudgetEntry(id: string): Promise<void> {
    await db.delete(budgetEntries).where(eq(budgetEntries.id, id));
  }

  async generateBudgetEntryTransactionId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `BUDG-${year}-`;
    
    const latestThisYear = await db
      .select()
      .from(budgetEntries)
      .where(like(budgetEntries.transactionId, `${prefix}%`))
      .orderBy(desc(budgetEntries.transactionId))
      .limit(1);
    
    let nextNumber = 1;
    if (latestThisYear.length > 0) {
      const parts = latestThisYear[0].transactionId.split('-');
      const currentNumber = parseInt(parts[2], 10);
      nextNumber = currentNumber + 1;
    }
    
    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
  }

  // Collection operations
  async getCollections(): Promise<Collection[]> {
    return await db.select().from(collections).orderBy(desc(collections.transactionDate));
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.id, id));
    return collection || undefined;
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const [collection] = await db
      .insert(collections)
      .values(insertCollection)
      .returning();
    return collection;
  }

  async updateCollection(id: string, updateData: Partial<InsertCollection>): Promise<Collection> {
    const [collection] = await db
      .update(collections)
      .set(updateData)
      .where(eq(collections.id, id))
      .returning();
    return collection;
  }

  async deleteCollection(id: string): Promise<void> {
    await db.delete(collections).where(eq(collections.id, id));
  }

  async generateCollectionTransactionId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `COLL-${year}-`;
    
    // Query only the latest record for the current year using LIKE
    // Note: This implementation is optimized for low-concurrency scenarios typical
    // of barangay office operations. For high-concurrency environments, consider:
    // 1. Database-side sequence or auto-increment counter
    // 2. Retry logic on unique key violations
    // 3. Database transaction with row-level locking
    const latestThisYear = await db
      .select()
      .from(collections)
      .where(like(collections.transactionId, `${prefix}%`))
      .orderBy(desc(collections.transactionId))
      .limit(1);
    
    let nextNumber = 1;
    if (latestThisYear.length > 0) {
      const parts = latestThisYear[0].transactionId.split('-');
      const currentNumber = parseInt(parts[2], 10);
      nextNumber = currentNumber + 1;
    }
    
    return `COLL-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  async reviewCollection(id: string, status: "approved" | "flagged", comment?: string, reviewedBy?: string): Promise<Collection> {
    const [collection] = await db
      .update(collections)
      .set({
        reviewStatus: status,
        reviewComment: comment || null,
        reviewedBy: reviewedBy || null,
        reviewedAt: new Date(),
      })
      .where(eq(collections.id, id))
      .returning();
    return collection;
  }

  // Disbursement operations
  async getDisbursements(): Promise<Disbursement[]> {
    return await db.select().from(disbursements).orderBy(desc(disbursements.transactionDate));
  }

  async getDisbursement(id: string): Promise<Disbursement | undefined> {
    const [disbursement] = await db.select().from(disbursements).where(eq(disbursements.id, id));
    return disbursement || undefined;
  }

  async createDisbursement(insertDisbursement: InsertDisbursement): Promise<Disbursement> {
    const [disbursement] = await db
      .insert(disbursements)
      .values(insertDisbursement)
      .returning();
    return disbursement;
  }

  async updateDisbursement(id: string, updateData: Partial<InsertDisbursement>): Promise<Disbursement> {
    const [disbursement] = await db
      .update(disbursements)
      .set(updateData)
      .where(eq(disbursements.id, id))
      .returning();
    return disbursement;
  }

  async deleteDisbursement(id: string): Promise<void> {
    await db.delete(disbursements).where(eq(disbursements.id, id));
  }

  async generateDisbursementTransactionId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `DISB-${year}-`;
    
    // Query only the latest record for the current year using LIKE
    const latestThisYear = await db
      .select()
      .from(disbursements)
      .where(like(disbursements.transactionId, `${prefix}%`))
      .orderBy(desc(disbursements.transactionId))
      .limit(1);
    
    let nextNumber = 1;
    if (latestThisYear.length > 0) {
      const parts = latestThisYear[0].transactionId.split('-');
      const currentNumber = parseInt(parts[2], 10);
      nextNumber = currentNumber + 1;
    }
    
    return `DISB-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  async reviewDisbursement(id: string, status: "approved" | "flagged", comment?: string, reviewedBy?: string): Promise<Disbursement> {
    const [disbursement] = await db
      .update(disbursements)
      .set({
        reviewStatus: status,
        reviewComment: comment || null,
        reviewedBy: reviewedBy || null,
        reviewedAt: new Date(),
      })
      .where(eq(disbursements.id, id))
      .returning();
    return disbursement;
  }

  // DFUR operations
  async getDfurProjects(): Promise<DfurProject[]> {
    return await db.select().from(dfurProjects).orderBy(desc(dfurProjects.transactionDate));
  }

  async getDfurProject(id: string): Promise<DfurProject | undefined> {
    const [project] = await db.select().from(dfurProjects).where(eq(dfurProjects.id, id));
    return project || undefined;
  }

  async createDfurProject(insertProject: InsertDfurProject): Promise<DfurProject> {
    const [project] = await db
      .insert(dfurProjects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateDfurProject(id: string, updateData: Partial<InsertDfurProject>): Promise<DfurProject> {
    const [project] = await db
      .update(dfurProjects)
      .set(updateData)
      .where(eq(dfurProjects.id, id))
      .returning();
    return project;
  }

  async deleteDfurProject(id: string): Promise<void> {
    await db.delete(dfurProjects).where(eq(dfurProjects.id, id));
  }

  async generateDfurTransactionId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `AIP-${year}-`;
    
    const latestThisYear = await db
      .select()
      .from(dfurProjects)
      .where(like(dfurProjects.transactionId, `${prefix}%`))
      .orderBy(desc(dfurProjects.transactionId))
      .limit(1);
    
    let nextNumber = 1;
    if (latestThisYear.length > 0) {
      const parts = latestThisYear[0].transactionId.split('-');
      const currentNumber = parseInt(parts[2], 10);
      nextNumber = currentNumber + 1;
    }
    
    return `AIP-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  async reviewDfurProject(id: string, status: "approved" | "flagged", comment?: string, reviewedBy?: string): Promise<DfurProject> {
    const [project] = await db
      .update(dfurProjects)
      .set({
        reviewStatus: status,
        reviewComment: comment || null,
        reviewedBy: reviewedBy || null,
        reviewedAt: new Date(),
      })
      .where(eq(dfurProjects.id, id))
      .returning();
    return project;
  }

  // Analytics
  async getFinancialSummary(): Promise<FinancialSummary> {
    const allRevenues = await this.getRevenues();
    const allExpenses = await this.getExpenses();

    const totalRevenues = allRevenues.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const totalExpenses = allExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const netBalance = totalRevenues - totalExpenses;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthRevenues = allRevenues
      .filter(r => {
        const date = new Date(r.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    const currentMonthExpenses = allExpenses
      .filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const lastMonth = currentMonth - 1;
    const lastMonthRevenues = allRevenues
      .filter(r => {
        const date = new Date(r.date);
        return date.getMonth() === lastMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    const lastMonthExpenses = allExpenses
      .filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === lastMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const revenueGrowth = lastMonthRevenues > 0 
      ? ((currentMonthRevenues - lastMonthRevenues) / lastMonthRevenues) * 100 
      : 0;

    const expenseGrowth = lastMonthExpenses > 0 
      ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
      : 0;

    return {
      totalRevenues,
      totalExpenses,
      netBalance,
      currentMonthRevenues,
      currentMonthExpenses,
      revenueGrowth,
      expenseGrowth,
    };
  }

  async getMonthlyData(): Promise<MonthlyData[]> {
    const allRevenues = await this.getRevenues();
    const allExpenses = await this.getExpenses();

    const monthlyMap = new Map<string, { revenues: number; expenses: number }>();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      monthlyMap.set(key, { revenues: 0, expenses: 0 });
    }

    allRevenues.forEach(r => {
      const date = new Date(r.date);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (monthlyMap.has(key)) {
        const current = monthlyMap.get(key)!;
        current.revenues += parseFloat(r.amount);
      }
    });

    allExpenses.forEach(e => {
      const date = new Date(e.date);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (monthlyMap.has(key)) {
        const current = monthlyMap.get(key)!;
        current.expenses += parseFloat(e.amount);
      }
    });

    return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      revenues: data.revenues,
      expenses: data.expenses,
    }));
  }

  async getRevenueByCategory(): Promise<CategoryData[]> {
    const allRevenues = await this.getRevenues();
    const categoryMap = new Map<string, number>();

    allRevenues.forEach(r => {
      const current = categoryMap.get(r.category) || 0;
      categoryMap.set(r.category, current + parseFloat(r.amount));
    });

    const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);

    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }));
  }

  async getExpenseByCategory(): Promise<CategoryData[]> {
    const allExpenses = await this.getExpenses();
    const categoryMap = new Map<string, number>();

    allExpenses.forEach(e => {
      const current = categoryMap.get(e.category) || 0;
      categoryMap.set(e.category, current + parseFloat(e.amount));
    });

    const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);

    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }));
  }

  async getCapitalOutlaySummary(year: number): Promise<CapitalOutlaySummary> {
    const { normalizeCapitalOutlayCategory } = await import("@shared/abr");
    
    // Fetch all budget entries (ABO) and disbursements (SRE)
    const allBudgetEntries = await this.getBudgetEntries();
    const allDisbursements = await this.getDisbursements();

    // Map for aggregating planned budget by subcategory
    const plannedMap = new Map<string, number>();
    
    // Map for aggregating actual spending by subcategory
    const actualMap = new Map<string, number>();

    // Aggregate planned budget from budget entries
    allBudgetEntries.forEach(entry => {
      const normalizedCategory = normalizeCapitalOutlayCategory(entry.category);
      const label = entry.subcategory || entry.category;
      const current = plannedMap.get(label) || 0;
      plannedMap.set(label, current + parseFloat(entry.amount as any));
    });

    // Aggregate actual spending from disbursements
    allDisbursements.forEach(disbursement => {
      const disbursementYear = new Date(disbursement.transactionDate).getFullYear();
      if (disbursementYear === year) {
        const normalizedCategory = normalizeCapitalOutlayCategory(disbursement.category);
        const label = disbursement.subcategory || disbursement.category;
        const current = actualMap.get(label) || 0;
        actualMap.set(label, current + parseFloat(disbursement.amount as any));
      }
    });

    // Combine all unique labels from both planned and actual
    const allLabels = new Set([...plannedMap.keys(), ...actualMap.keys()]);

    // Build items array
    const items = Array.from(allLabels).map(label => {
      const planned = plannedMap.get(label) || 0;
      const actual = actualMap.get(label) || 0;
      const variance = planned - actual;
      const variancePercentage = planned > 0 ? ((variance / planned) * 100) : 0;

      return {
        label,
        planned,
        actual,
        variance,
        variancePercentage,
      };
    }).sort((a, b) => b.planned - a.planned); // Sort by planned budget descending

    // Calculate totals
    const totalPlanned = items.reduce((sum, item) => sum + item.planned, 0);
    const totalActual = items.reduce((sum, item) => sum + item.actual, 0);
    const totalVariance = totalPlanned - totalActual;
    const totalVariancePercentage = totalPlanned > 0 ? ((totalVariance / totalPlanned) * 100) : 0;

    return {
      year,
      items,
      totals: {
        planned: totalPlanned,
        actual: totalActual,
        variance: totalVariance,
        variancePercentage: totalVariancePercentage,
      },
    };
  }

  // Activity Log - Aggregates all recent transactions
  async getActivityLog(limit: number = 50): Promise<ActivityLog[]> {
    const activities: ActivityLog[] = [];
    
    // Helper to safely parse dates - only create Date if value is truthy
    const safeDate = (dateStr?: string | Date | null): Date => {
      if (!dateStr) return new Date(0);
      const parsed = new Date(dateStr);
      return isNaN(parsed.getTime()) ? new Date(0) : parsed;
    };
    
    // Helper to safely parse amounts - ensure valid numeric string
    const safeAmount = (amount?: string | null): string => {
      if (!amount || amount.trim() === '') return "0";
      const num = parseFloat(amount);
      return !isNaN(num) ? amount : "0";
    };
    
    // Fetch all transactions
    const allCollections = await this.getCollections();
    const allDisbursements = await this.getDisbursements();
    const allDfurProjects = await this.getDfurProjects();
    const allBudgetEntries = await this.getBudgetEntries();
    
    // Add collections
    allCollections.forEach(collection => {
      const description = [
        collection.natureOfCollection || "Collection",
        collection.payor || "Unknown"
      ].filter(Boolean).join(" - ");
      
      const transactionDate = safeDate(collection.transactionDate || collection.createdAt);
      const createdDate = collection.createdAt ? safeDate(collection.createdAt) : undefined;
      
      activities.push({
        id: collection.id,
        transactionId: collection.transactionId,
        type: "collection",
        date: transactionDate,
        description,
        amount: safeAmount(collection.amount),
        category: collection.category || "Uncategorized",
        status: collection.reviewStatus || "pending",
        createdAt: createdDate,
      });
    });
    
    // Add disbursements
    allDisbursements.forEach(disbursement => {
      const description = [
        disbursement.natureOfDisbursement || "Disbursement",
        disbursement.payee || "Unknown"
      ].filter(Boolean).join(" - ");
      
      const transactionDate = safeDate(disbursement.transactionDate || disbursement.createdAt);
      const createdDate = disbursement.createdAt ? safeDate(disbursement.createdAt) : undefined;
      
      activities.push({
        id: disbursement.id,
        transactionId: disbursement.transactionId,
        type: "disbursement",
        date: transactionDate,
        description,
        amount: safeAmount(disbursement.amount),
        category: disbursement.category || "Uncategorized",
        status: disbursement.reviewStatus || "pending",
        createdAt: createdDate,
      });
    });
    
    // Add DFUR projects
    allDfurProjects.forEach(project => {
      const description = [
        project.project || "DFUR Project",
        project.location || ""
      ].filter(Boolean).join(" - ");
      
      const transactionDate = safeDate(project.transactionDate || project.createdAt);
      const createdDate = project.createdAt ? safeDate(project.createdAt) : undefined;
      
      activities.push({
        id: project.id,
        transactionId: project.transactionId,
        type: "dfur",
        date: transactionDate,
        description,
        amount: safeAmount(project.totalCostApproved),
        category: "Development Fund",
        status: project.status || "pending",
        createdAt: createdDate,
      });
    });
    
    // Add budget entries
    allBudgetEntries.forEach(entry => {
      const parts = [
        entry.expenditureProgram || entry.programDescription || "Budget Entry"
      ];
      if (entry.payee) parts.push(entry.payee);
      const description = parts.join(" - ");
      
      const transactionDate = safeDate(entry.transactionDate || entry.createdAt);
      const createdDate = entry.createdAt ? safeDate(entry.createdAt) : undefined;
      
      activities.push({
        id: entry.id,
        transactionId: entry.transactionId,
        type: "budget_entry",
        date: transactionDate,
        description,
        amount: safeAmount(entry.amount),
        category: entry.category || "Uncategorized",
        status: "approved",
        createdAt: createdDate,
      });
    });
    
    // Sort by createdAt first (most recent first), then by transaction date as fallback
    return activities
      .sort((a, b) => {
        // Try sorting by createdAt first
        if (a.createdAt && b.createdAt) {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
        // Fallback to transaction date
        return b.date.getTime() - a.date.getTime();
      })
      .slice(0, limit);
  }

  // User operations
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<Omit<InsertUser, 'username'>>): Promise<User> {
    const result = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async updateLastLogin(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }

  // Viewer Comments operations
  async createViewerComment(comment: InsertViewerComment): Promise<ViewerComment> {
    const [newComment] = await db.insert(viewerComments).values(comment).returning();
    return newComment;
  }

  async getViewerComments(status?: string): Promise<ViewerComment[]> {
    if (status) {
      return await db
        .select()
        .from(viewerComments)
        .where(eq(viewerComments.status, status))
        .orderBy(desc(viewerComments.createdAt));
    }
    return await db.select().from(viewerComments).orderBy(desc(viewerComments.createdAt));
  }

  async updateCommentStatus(id: string, status: string, reviewedBy?: string): Promise<ViewerComment> {
    const [updated] = await db
      .update(viewerComments)
      .set({
        status,
        reviewedBy,
        reviewedAt: new Date(),
      })
      .where(eq(viewerComments.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
