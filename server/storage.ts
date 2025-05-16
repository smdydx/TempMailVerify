import { connectDB } from './db';
import { ObjectId } from 'mongodb';
import { TempEmail, InsertTempEmail, Message, InsertMessage, User, UpsertUser, tempEmails, messages, users } from "@shared/schema";

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
  markMessageAsRead(id: number): Promise<boolean>;
  deleteMessage(id: number): Promise<boolean>;
}

class Storage implements IStorage {
  private db: any;

  async initialize() {
    this.db = await connectDB();
  }

  async createTempEmail(emailData: InsertTempEmail): Promise<TempEmail> {
    const collection = this.db.collection('emails');
    const result = await collection.insertOne({ address: emailData.address, createdAt: new Date() });
    return { id: result.insertedId.toString(), address: emailData.address, createdAt: new Date() };
  }

  async getTempEmailByAddress(address: string) {
    const collection = this.db.collection('emails');
    const email = await collection.findOne({ address });
    if (!email) {
      return undefined;
    }
    return { id: email._id.toString(), address: email.address, createdAt: email.createdAt };
  }

  async getAllTempEmails(): Promise<TempEmail[]> {
    const collection = this.db.collection('emails');
    const emails = await collection.find().toArray();
    return emails.map(email => ({ id: email._id.toString(), address: email.address, createdAt: email.createdAt }));
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const collection = this.db.collection('messages');
    const result = await collection.insertOne({
      ...messageData,
      receivedAt: new Date(),
      isRead: false
    });
    return { id: result.insertedId.toString(), ...messageData, receivedAt: new Date(), isRead: false };
  }

  async getMessagesByEmailId(emailId: number): Promise<Message[]> {
    const collection = this.db.collection('messages');
    const messages = await collection.find({ emailId }).toArray();
    return messages.map(message => ({
      id: message._id.toString(),
      emailId: message.emailId,
      sender: message.sender,
      subject: message.subject,
      body: message.body,
      receivedAt: message.receivedAt,
      isRead: message.isRead
    }));
  }

  async getMessageById(id: number): Promise<Message | undefined> {
    const collection = this.db.collection('messages');
    const message = await collection.findOne({ _id: new ObjectId(id) });
    if (!message) {
      return undefined;
    }
    return {
      id: message._id.toString(),
      emailId: message.emailId,
      sender: message.sender,
      subject: message.subject,
      body: message.body,
      receivedAt: message.receivedAt,
      isRead: message.isRead
    };
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
     const collection = this.db.collection('messages');
     const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { isRead: true } });

     if (result.modifiedCount === 0) {
       return undefined;
     }

     const updatedMessage = await collection.findOne({ _id: new ObjectId(id) });

     if (!updatedMessage) {
       return undefined;
     }

     return {
        id: updatedMessage._id.toString(),
        emailId: updatedMessage.emailId,
        sender: updatedMessage.sender,
        subject: updatedMessage.subject,
        body: updatedMessage.body,
        receivedAt: updatedMessage.receivedAt,
        isRead: updatedMessage.isRead
     };
  }

  async deleteMessage(id: number): Promise<boolean> {
    const collection = this.db.collection('messages');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  async getUser(id: string): Promise<User | undefined> {
    const collection = this.db.collection('users');
    const user = await collection.findOne({ id });
    if (!user) {
        return undefined;
    }
    return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
      const collection = this.db.collection('users');
      const filter = { id: userData.id };
      const update = {
          $set: {
              ...userData,
              updatedAt: new Date()
          }
      };
      const options = { upsert: true };

      await collection.updateOne(filter, update, options);

      const user = await collection.findOne({ id: userData.id });
      if (!user) {
          throw new Error("User not found after upsert");
      }
      return {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
      };
  }
}

export const storage = new Storage();
storage.initialize();