import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  rating: serial("rating"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const history = pgTable("history", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const downloads = pgTable("downloads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  size: text("size"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).pick({
  message: true,
  rating: true,
});

export const insertHistorySchema = createInsertSchema(history).pick({
  url: true,
  title: true,
});

export const insertDownloadSchema = createInsertSchema(downloads).pick({
  filename: true,
  url: true,
  status: true,
  size: true,
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type History = typeof history.$inferSelect;
export type InsertHistory = z.infer<typeof insertHistorySchema>;

export type Download = typeof downloads.$inferSelect;
export type InsertDownload = z.infer<typeof insertDownloadSchema>;
