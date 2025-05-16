import { InsertMessage } from "@shared/schema";
import { storage } from "./storage";

export interface EmailServiceInterface {
  generateRandomEmail(): string;
  extractOTPFromContent(content: string): string | null;
  simulateEmailReception(emailAddress: string): void;
}

export class EmailService implements EmailServiceInterface {
  private static readonly emailProviders = [
    { name: "Replit Account Verification", email: "noreply@replit.com" },
    { name: "Replit Security", email: "security@replit.com" },
    { name: "Replit Auth", email: "auth@replit.com" },
    { name: "Replit ID", email: "id@replit.com" },
  ];

  private static readonly otpVerificationTemplates = [
    "Your Replit verification code is: {OTP}. Use this to verify your account.",
    "Welcome to Replit! Your verification code is {OTP}. This code expires in 10 minutes.",
    "Use code {OTP} to verify your Replit account. Don't share this code.",
    "Your Replit security code: {OTP}. Enter this to complete verification.",
    "Here's your Replit authentication code: {OTP}. Valid for 5 minutes."
  ];

  private static readonly websockets = new Set<any>();

  constructor() {}

  // Register a websocket connection
  static addWebSocket(ws: any) {
    this.websockets.add(ws);
  }

  // Remove a websocket connection
  static removeWebSocket(ws: any) {
    this.websockets.delete(ws);
  }

  // Broadcast to all connected websockets with retry mechanism
  private static broadcast(data: any) {
    console.log('Broadcasting message:', data);
    this.websockets.forEach(ws => {
      const trySend = (retries = 5) => {
        try {
          if (ws.readyState === 1) { // 1 = OPEN
            const stringifiedData = JSON.stringify(data);
            ws.send(stringifiedData);
            console.log('Successfully sent message:', stringifiedData);
            console.log('Message sent successfully to a client');
          } else if (retries > 0 && ws.readyState === 0) { // 0 = CONNECTING
            setTimeout(() => trySend(retries - 1), 1000);
          }
        } catch (error) {
          console.error('Error broadcasting message:', error);
          if (retries > 0) {
            setTimeout(() => trySend(retries - 1), 1000);
          }
        }
      };
      trySend();
    });
  }

  // Common first and last names stored as class properties
  private static readonly firstNames = [
    'john', 'alex', 'sara', 'mike', 'lisa', 'david', 'emma', 'james', 'sophia', 'ryan',
    'robert', 'jennifer', 'michael', 'jessica', 'william', 'amanda', 'richard', 'elizabeth',
    'thomas', 'olivia', 'charles', 'emily', 'daniel', 'hannah', 'matthew', 'sarah'
  ];
  
  private static readonly lastNames = [
    'smith', 'jones', 'brown', 'miller', 'wilson', 'taylor', 'clark', 'davis', 'white', 'moore',
    'anderson', 'thomas', 'jackson', 'martin', 'thompson', 'williams', 'johnson', 'roberts',
    'robinson', 'walker', 'young', 'allen', 'king', 'wright', 'scott', 'green'
  ];

  // Helper method to get random item from an array
  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Generate a random email address that passes Replit validation
  generateRandomEmail(): string {
    const firstName = this.getRandomItem(EmailService.firstNames);
    const lastName = this.getRandomItem(EmailService.lastNames);
    
    // Create random numbers commonly found in email addresses
    const randomNum = Math.floor(100 + Math.random() * 900);
    const currentYear = new Date().getFullYear();
    const birthYear = Math.floor(1980 + Math.random() * 25);
    
    // Create various formats that work with Replit registration
    const formats = [
      // Standard formats that work well with most services
      `${firstName}.${lastName}${randomNum}@gmail.com`,
      `${firstName}${lastName}${randomNum}@gmail.com`,
      
      // Format with birth year - often appears legitimate
      `${firstName}${lastName}${birthYear}@gmail.com`,
      `${firstName}.${lastName}${birthYear}@gmail.com`,
      
      // First initial + last name format (common in professional settings)
      `${firstName.charAt(0)}${lastName}${randomNum}@gmail.com`,
      
      // Underscore format (less common but still passes validation)
      `${firstName}_${lastName}${randomNum}@gmail.com`,
      
      // Email formats that real people might use with their birth year
      `${firstName}${lastName.charAt(0)}${birthYear}@gmail.com`,
      
      // Format with abbreviated current year (like john.smith23@gmail.com)
      `${firstName}.${lastName}${currentYear.toString().slice(2)}@gmail.com`
    ];
    
    return this.getRandomItem(formats);
  }

  // Extract OTP from email content using regex pattern matching
  extractOTPFromContent(content: string): string | null {
    // Look for common OTP patterns (4-8 digit numbers often labeled as code/OTP/verification)
    const otpRegexPatterns = [
      /verification code[^\d]*(\d{4,8})/i,
      /security code[^\d]*(\d{4,8})/i,
      /code is[^\d]*(\d{4,8})/i,
      /one-time password[^\d]*(\d{4,8})/i,
      /OTP[^\d]*(\d{4,8})/i,
      /code[^\d]*(\d{4,8})/i,
      /(\d{4,8})[^\d]*(is your)/i,
    ];

    for (const pattern of otpRegexPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // If no specific pattern matches, try to extract any 6-digit number as a fallback
    const digitMatch = content.match(/\b(\d{6})\b/);
    if (digitMatch && digitMatch[1]) {
      return digitMatch[1];
    }

    return null;
  }

  // Generate a random OTP code (6 digits)
  private generateOTPCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Simulate receiving an email for a specific address
  async simulateEmailReception(emailAddress: string) {
    try {
      console.log('Simulating email reception for:', emailAddress);
      // Get or create the email address
      let tempEmail = await storage.getTempEmailByAddress(emailAddress);
      if (!tempEmail) {
        console.log('Creating new temp email');
        tempEmail = await storage.createTempEmail({ address: emailAddress });
      }

      // Generate random provider info
      const providerInfo = EmailService.emailProviders[
        Math.floor(Math.random() * EmailService.emailProviders.length)
      ];

      // Generate OTP code
      const otpCode = this.generateOTPCode();

      // Create content by replacing placeholders in template
      const templateIndex = Math.floor(Math.random() * EmailService.otpVerificationTemplates.length);
      const template = EmailService.otpVerificationTemplates[templateIndex];
      const serviceName = providerInfo.name.split(' ')[0]; // Use first word of provider name
      
      const content = template
        .replace('{OTP}', otpCode)
        .replace('{SERVICE}', serviceName);

      // Create message object
      const message: InsertMessage = {
        emailId: tempEmail.id,
        sender: providerInfo.email,
        senderName: providerInfo.name,
        subject: `${serviceName} Verification Code`,
        content: content,
        otpCode: otpCode,
      };

      // Store the message
      const savedMessage = await storage.createMessage(message);

      // Broadcast the new message to all connected clients
      EmailService.broadcast({
        type: 'NEW_MESSAGE',
        message: savedMessage,
        emailAddress: emailAddress
      });

      return savedMessage;
    } catch (error) {
      console.error('Error simulating email reception:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
