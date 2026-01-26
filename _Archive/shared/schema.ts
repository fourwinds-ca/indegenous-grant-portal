import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  uuid,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Grants table - stores discovered grants and programs
export const grants = pgTable("grants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  agency: varchar("agency", { length: 200 }),
  program: varchar("program", { length: 200 }),
  category: varchar("category", { length: 100 }),
  eligibility: text("eligibility"),
  applicationLink: varchar("application_link", { length: 1000 }),
  deadline: date("deadline"),
  amount: decimal("amount"),
  currency: varchar("currency", { length: 3 }).default("CAD"),
  status: varchar("status", { length: 50 }).default("active"), // active, inactive, closed
  sourceUrl: varchar("source_url", { length: 1000 }),
  scrapedAt: timestamp("scraped_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User grant applications - tracks which grants users have applied to
export const userGrantApplications = pgTable("user_grant_applications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  grantId: uuid("grant_id").notNull().references(() => grants.id),
  applicationStatus: varchar("application_status", { length: 50 }).default("planning"), // planning, in_progress, submitted, under_review, approved, rejected, completed
  applicationDate: date("application_date"),
  submissionDate: date("submission_date"),
  responseDate: date("response_date"),
  amountRequested: decimal("amount_requested"),
  amountApproved: decimal("amount_approved"),
  notes: text("notes"),
  documents: jsonb("documents"), // Array of document references
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reporting requirements tracking
export const reportingRequirements = pgTable("reporting_requirements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: uuid("application_id").notNull().references(() => userGrantApplications.id),
  requirementType: varchar("requirement_type", { length: 100 }).notNull(), // financial, progress, final, quarterly, etc.
  description: text("description"),
  dueDate: date("due_date"),
  completed: boolean("completed").default(false),
  submissionDate: date("submission_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scraped sources tracking - to avoid duplicate scraping
export const scrapedSources = pgTable("scraped_sources", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  url: varchar("url", { length: 1000 }).notNull().unique(),
  domain: varchar("domain", { length: 200 }),
  lastScraped: timestamp("last_scraped").defaultNow(),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  grantsFound: integer("grants_found").default(0),
});

// Analytics/metrics tracking
export const metrics = pgTable("metrics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  metricType: varchar("metric_type", { length: 100 }).notNull(), // applications_submitted, approvals, rejections, dollars_requested, dollars_approved
  value: decimal("value"),
  date: date("date").notNull(),
  grantId: uuid("grant_id").references(() => grants.id),
  applicationId: uuid("application_id").references(() => userGrantApplications.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  applications: many(userGrantApplications),
  metrics: many(metrics),
}));

export const grantsRelations = relations(grants, ({ many }) => ({
  applications: many(userGrantApplications),
  metrics: many(metrics),
}));

export const userGrantApplicationsRelations = relations(userGrantApplications, ({ one, many }) => ({
  user: one(users, {
    fields: [userGrantApplications.userId],
    references: [users.id],
  }),
  grant: one(grants, {
    fields: [userGrantApplications.grantId],
    references: [grants.id],
  }),
  reportingRequirements: many(reportingRequirements),
  metrics: many(metrics),
}));

export const reportingRequirementsRelations = relations(reportingRequirements, ({ one }) => ({
  application: one(userGrantApplications, {
    fields: [reportingRequirements.applicationId],
    references: [userGrantApplications.id],
  }),
}));

export const metricsRelations = relations(metrics, ({ one }) => ({
  user: one(users, {
    fields: [metrics.userId],
    references: [users.id],
  }),
  grant: one(grants, {
    fields: [metrics.grantId],
    references: [grants.id],
  }),
  application: one(userGrantApplications, {
    fields: [metrics.applicationId],
    references: [userGrantApplications.id],
  }),
}));

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Grant = typeof grants.$inferSelect;
export type InsertGrant = typeof grants.$inferInsert;
export type UserGrantApplication = typeof userGrantApplications.$inferSelect;
export type InsertUserGrantApplication = typeof userGrantApplications.$inferInsert;
export type ReportingRequirement = typeof reportingRequirements.$inferSelect;
export type InsertReportingRequirement = typeof reportingRequirements.$inferInsert;
export type ScrapedSource = typeof scrapedSources.$inferSelect;
export type InsertScrapedSource = typeof scrapedSources.$inferInsert;
export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = typeof metrics.$inferInsert;