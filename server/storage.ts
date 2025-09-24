import {
  users,
  grants,
  userGrantApplications,
  reportingRequirements,
  scrapedSources,
  metrics,
  type User,
  type UpsertUser,
  type Grant,
  type InsertGrant,
  type UserGrantApplication,
  type InsertUserGrantApplication,
  type ReportingRequirement,
  type InsertReportingRequirement,
  type ScrapedSource,
  type InsertScrapedSource,
  type Metric,
  type InsertMetric,
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, sum } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Grant operations
  createGrant(grant: InsertGrant): Promise<Grant>;
  updateGrant(id: string, grant: Partial<Grant>): Promise<Grant>;
  getGrant(id: string): Promise<Grant | undefined>;
  getAllGrants(limit?: number, offset?: number): Promise<Grant[]>;
  searchGrants(query: string): Promise<Grant[]>;
  
  // User grant application operations
  createApplication(application: InsertUserGrantApplication): Promise<UserGrantApplication>;
  updateApplication(id: string, application: Partial<UserGrantApplication>): Promise<UserGrantApplication>;
  getUserApplications(userId: string): Promise<UserGrantApplication[]>;
  getApplication(id: string): Promise<UserGrantApplication | undefined>;
  
  // Reporting requirements operations
  createReportingRequirement(requirement: InsertReportingRequirement): Promise<ReportingRequirement>;
  updateReportingRequirement(id: string, requirement: Partial<ReportingRequirement>): Promise<ReportingRequirement>;
  getUserReportingRequirements(userId: string): Promise<ReportingRequirement[]>;
  
  // Scraped sources operations
  createScrapedSource(source: InsertScrapedSource): Promise<ScrapedSource>;
  updateScrapedSource(url: string, source: Partial<ScrapedSource>): Promise<ScrapedSource>;
  getScrapedSource(url: string): Promise<ScrapedSource | undefined>;
  
  // Metrics operations
  createMetric(metric: InsertMetric): Promise<Metric>;
  getUserMetrics(userId: string, metricType?: string): Promise<Metric[]>;
  getGlobalMetrics(metricType?: string): Promise<Metric[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Grant operations
  async createGrant(grantData: InsertGrant): Promise<Grant> {
    const [grant] = await db
      .insert(grants)
      .values(grantData)
      .returning();
    return grant;
  }

  async updateGrant(id: string, grantData: Partial<Grant>): Promise<Grant> {
    const [grant] = await db
      .update(grants)
      .set({ ...grantData, lastUpdated: new Date() })
      .where(eq(grants.id, id))
      .returning();
    return grant;
  }

  async getGrant(id: string): Promise<Grant | undefined> {
    const [grant] = await db.select().from(grants).where(eq(grants.id, id));
    return grant;
  }

  async getAllGrants(limit: number = 50, offset: number = 0): Promise<Grant[]> {
    return await db
      .select()
      .from(grants)
      .orderBy(desc(grants.lastUpdated))
      .limit(limit)
      .offset(offset);
  }

  async searchGrants(query: string): Promise<Grant[]> {
    return await db
      .select()
      .from(grants)
      .where(
        // Simple text search - could be enhanced with full-text search
        eq(grants.title, query) // This is a basic implementation, real search would use ilike or full-text
      )
      .orderBy(desc(grants.lastUpdated));
  }

  // User grant application operations
  async createApplication(applicationData: InsertUserGrantApplication): Promise<UserGrantApplication> {
    const [application] = await db
      .insert(userGrantApplications)
      .values(applicationData)
      .returning();
    return application;
  }

  async updateApplication(id: string, applicationData: Partial<UserGrantApplication>): Promise<UserGrantApplication> {
    const [application] = await db
      .update(userGrantApplications)
      .set({ ...applicationData, updatedAt: new Date() })
      .where(eq(userGrantApplications.id, id))
      .returning();
    return application;
  }

  async getUserApplications(userId: string): Promise<UserGrantApplication[]> {
    return await db
      .select()
      .from(userGrantApplications)
      .where(eq(userGrantApplications.userId, userId))
      .orderBy(desc(userGrantApplications.createdAt));
  }

  async getApplication(id: string): Promise<UserGrantApplication | undefined> {
    const [application] = await db
      .select()
      .from(userGrantApplications)
      .where(eq(userGrantApplications.id, id));
    return application;
  }

  // Reporting requirements operations
  async createReportingRequirement(requirementData: InsertReportingRequirement): Promise<ReportingRequirement> {
    const [requirement] = await db
      .insert(reportingRequirements)
      .values(requirementData)
      .returning();
    return requirement;
  }

  async updateReportingRequirement(id: string, requirementData: Partial<ReportingRequirement>): Promise<ReportingRequirement> {
    const [requirement] = await db
      .update(reportingRequirements)
      .set({ ...requirementData, updatedAt: new Date() })
      .where(eq(reportingRequirements.id, id))
      .returning();
    return requirement;
  }

  async getUserReportingRequirements(userId: string): Promise<ReportingRequirement[]> {
    return await db
      .select()
      .from(reportingRequirements)
      .innerJoin(userGrantApplications, eq(reportingRequirements.applicationId, userGrantApplications.id))
      .where(eq(userGrantApplications.userId, userId))
      .orderBy(desc(reportingRequirements.dueDate));
  }

  // Scraped sources operations
  async createScrapedSource(sourceData: InsertScrapedSource): Promise<ScrapedSource> {
    const [source] = await db
      .insert(scrapedSources)
      .values(sourceData)
      .returning();
    return source;
  }

  async updateScrapedSource(url: string, sourceData: Partial<ScrapedSource>): Promise<ScrapedSource> {
    const [source] = await db
      .update(scrapedSources)
      .set({ ...sourceData, lastScraped: new Date() })
      .where(eq(scrapedSources.url, url))
      .returning();
    return source;
  }

  async getScrapedSource(url: string): Promise<ScrapedSource | undefined> {
    const [source] = await db
      .select()
      .from(scrapedSources)
      .where(eq(scrapedSources.url, url));
    return source;
  }

  // Metrics operations
  async createMetric(metricData: InsertMetric): Promise<Metric> {
    const [metric] = await db
      .insert(metrics)
      .values(metricData)
      .returning();
    return metric;
  }

  async getUserMetrics(userId: string, metricType?: string): Promise<Metric[]> {
    const conditions = [eq(metrics.userId, userId)];
    if (metricType) {
      conditions.push(eq(metrics.metricType, metricType));
    }
    
    return await db
      .select()
      .from(metrics)
      .where(and(...conditions))
      .orderBy(desc(metrics.date));
  }

  async getGlobalMetrics(metricType?: string): Promise<Metric[]> {
    let query = db.select().from(metrics);
    
    if (metricType) {
      query = query.where(eq(metrics.metricType, metricType));
    }
    
    return await query.orderBy(desc(metrics.date));
  }
}

export const storage = new DatabaseStorage();