import { pgTable, text, varchar, serial, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User table for auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const upsertUserSchema = createInsertSchema(users);
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

// Email schema for temp emails
export const tempEmails = pgTable("temp_emails", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTempEmailSchema = createInsertSchema(tempEmails).pick({
  address: true,
});

export type InsertTempEmail = z.infer<typeof insertTempEmailSchema>;
export type TempEmail = typeof tempEmails.$inferSelect;

// Email message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  emailId: integer("email_id").notNull(),
  sender: text("sender").notNull(),
  senderName: text("sender_name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  otpCode: text("otp_code"),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  isRead: boolean("is_read").default(false).notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  emailId: true,
  sender: true,
  senderName: true,
  subject: true,
  content: true,
  otpCode: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
