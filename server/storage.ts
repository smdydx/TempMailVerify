import { TempEmail, InsertTempEmail, Message, InsertMessage, User, UpsertUser, tempEmails, messages, users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Temp email operations
  createTempEmail(email: InsertTempEmail): Promise<TempEmail>;
  getTempEmailByAddress(address: string): Promise<TempEmail | undefined>;
  getAllTempEmails(): Promise<TempEmail[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByEmailId(emailId: number): Promise<Message[]>;
  getMessageById(id: number): Promise<Message | undefined>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  deleteMessage(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        updatedAt: new Date()
      })
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

  // Temp email operations
  async createTempEmail(email: InsertTempEmail): Promise<TempEmail> {
    const [tempEmail] = await db
      .insert(tempEmails)
      .values({
        ...email,
        createdAt: new Date()
      })
      .returning();
    return tempEmail;
  }

  async getTempEmailByAddress(address: string): Promise<TempEmail | undefined> {
    const [tempEmail] = await db
      .select()
      .from(tempEmails)
      .where(eq(tempEmails.address, address));
    return tempEmail;
  }

  async getAllTempEmails(): Promise<TempEmail[]> {
    return await db.select().from(tempEmails);
  }

  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({
        ...insertMessage,
        receivedAt: new Date(),
        isRead: false
      })
      .returning();
    return message;
  }

  async getMessagesByEmailId(emailId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.emailId, emailId))
      .orderBy(messages.receivedAt); // Newest first
  }

  async getMessageById(id: number): Promise<Message | undefined> {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id));
    return message;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [message] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return message;
  }

  async deleteMessage(id: number): Promise<boolean> {
    await db
      .delete(messages)
      .where(eq(messages.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
