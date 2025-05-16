import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emailService, EmailService } from "./emailService";
import { ssoEmailService } from "./ssoEmailService";
import { z } from "zod";
import { insertTempEmailSchema } from "@shared/schema";
import { WebSocketServer } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });

  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    console.log('Total active WebSocket connections:', wss.clients.size);
    
    // Add the websocket to our collection
    EmailService.addWebSocket(ws);

    // Send initial connection success message
    ws.send(JSON.stringify({
      type: 'CONNECTION_STATUS',
      status: 'connected'
    }));
    
    // Send a connection acknowledgment
    ws.send(JSON.stringify({ type: 'CONNECTED' }));
    
    // Handle WebSocket messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        
        // Handle different message types
        if (data.type === 'SUBSCRIBE_EMAIL') {
          console.log('Subscribing to email:', data.emailAddress);
          // Client is subscribing to updates for this email
          ws.send(JSON.stringify({ 
            type: 'SUBSCRIBED', 
            emailAddress: data.emailAddress 
          }));
          
          // Immediately simulate messages for verification
          Promise.all([
            emailService.simulateEmailReception(data.emailAddress),
            ssoEmailService.simulateSSOVerification(data.emailAddress)
          ]).catch(console.error);
          
          // Simulate an initial verification message
          const message = await emailService.simulateEmailReception(data.emailAddress);
          console.log('Simulated message:', message);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({ 
          type: 'ERROR', 
          message: 'Failed to process message' 
        }));
      }
    });
    
    // Handle WebSocket disconnections
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      EmailService.removeWebSocket(ws);
    });
  });

  // API Routes
  // Get or generate a temporary email (Gmail style)
  app.post('/api/email/generate', async (req, res) => {
    try {
      const newEmailAddress = emailService.generateRandomEmail();
      const tempEmailData = { address: newEmailAddress };
      
      // Validate the generated email address with zod schema
      const validatedData = insertTempEmailSchema.parse(tempEmailData);
      
      // Create the temp email in storage
      const tempEmail = await storage.createTempEmail(validatedData);
      
      return res.status(201).json({
        success: true,
        email: tempEmail
      });
    } catch (error) {
      console.error('Error generating email:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate temporary email address'
      });
    }
  });
  
  // Generate an SSO-compatible email
  app.post('/api/email/generate-sso', async (req, res) => {
    try {
      const newEmailAddress = ssoEmailService.generateSSOEmail();
      const tempEmailData = { address: newEmailAddress };
      
      // Validate the generated email address with zod schema
      const validatedData = insertTempEmailSchema.parse(tempEmailData);
      
      // Create the temp email in storage
      const tempEmail = await storage.createTempEmail(validatedData);
      
      return res.status(201).json({
        success: true,
        email: tempEmail
      });
    } catch (error) {
      console.error('Error generating SSO email:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate SSO email address'
      });
    }
  });

  // Get messages for a specific email
  app.get('/api/email/:address/messages', async (req, res) => {
    try {
      const { address } = req.params;
      
      // Find the email by address
      const tempEmail = await storage.getTempEmailByAddress(address);
      if (!tempEmail) {
        return res.status(404).json({
          success: false,
          message: 'Email address not found'
        });
      }
      
      // Get all messages for this email
      const messages = await storage.getMessagesByEmailId(tempEmail.id);
      
      return res.status(200).json({
        success: true,
        messages
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch messages'
      });
    }
  });

  // Mark a message as read
  app.patch('/api/messages/:id/read', async (req, res) => {
    try {
      const { id } = req.params;
      const messageId = parseInt(id, 10);
      
      if (isNaN(messageId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid message ID'
        });
      }
      
      const updatedMessage = await storage.markMessageAsRead(messageId);
      if (!updatedMessage) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: updatedMessage
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark message as read'
      });
    }
  });

  // Simulate receiving an email (for development and testing)
  app.post('/api/simulate/receive', async (req, res) => {
    try {
      const schema = z.object({
        emailAddress: z.string().email(),
        type: z.enum(['normal', 'sso']).optional()
      });
      
      const { emailAddress, type = 'normal' } = schema.parse(req.body);
      
      // Simulate receiving an email based on type
      let message;
      if (type === 'sso') {
        message = await ssoEmailService.simulateSSOVerification(emailAddress);
      } else {
        message = await emailService.simulateEmailReception(emailAddress);
      }
      
      return res.status(201).json({
        success: true,
        message
      });
    } catch (error) {
      console.error('Error simulating email reception:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to simulate email reception'
      });
    }
  });

  return httpServer;
}
