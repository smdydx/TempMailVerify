import { InsertMessage } from "@shared/schema";
import { storage } from "./storage";

export interface SSOEmailServiceInterface {
  generateSSOEmail(): string;
  simulateSSOVerification(emailAddress: string): Promise<any>;
}

export class SSOEmailService implements SSOEmailServiceInterface {
  // SSO provider domains for more realistic emails
  private static readonly ssoProviders = [
    { name: "Corporate SSO", domain: "sso.company.org" },
    { name: "Enterprise ID", domain: "id.enterprise.com" },
    { name: "Secure Access", domain: "access.secure-login.net" },
    { name: "Identity Suite", domain: "identity.suite.io" },
    { name: "Single Sign On", domain: "auth.single-sign-on.com" }
  ];

  // SSO verification templates
  private static readonly ssoVerificationTemplates = [
    "Your SSO verification code is {CODE}. Enter this code to complete your single sign-on authentication.",
    "Use verification code {CODE} to authorize SSO login to your account. This code will expire in 5 minutes.",
    "SSO Authentication Required: Your verification code is {CODE}. Do not share this code with anyone.",
    "SAML SSO Verification: Enter code {CODE} to complete your authentication process.",
    "To continue with SSO login, enter security code: {CODE}. This is a one-time verification code."
  ];

  // Generate a professional SSO-compatible email address optimized for Replit signup
  generateSSOEmail(): string {
    // Choose random provider
    const provider = SSOEmailService.ssoProviders[
      Math.floor(Math.random() * SSOEmailService.ssoProviders.length)
    ];
    
    // Generate realistic corporate usernames - these formats are known to work with Replit
    const userFormats = [
      // Standard corporate formats (firstname.lastname style)
      () => {
        const names = ["john", "sara", "michael", "emma", "david", "jennifer", "robert", "lisa"];
        const surnames = ["smith", "johnson", "williams", "jones", "brown", "davis", "miller", "wilson"];
        const name = names[Math.floor(Math.random() * names.length)];
        const surname = surnames[Math.floor(Math.random() * surnames.length)];
        return `${name}.${surname}`;
      },
      
      // Role-based corporate emails
      () => {
        const roles = ["developer", "admin", "manager", "user", "support", "sales", "finance", "hr"];
        return roles[Math.floor(Math.random() * roles.length)];
      },
      
      // Department-based emails with numbers that look legitimate
      () => {
        const depts = ["it", "hr", "dev", "sales", "support", "marketing", "finance", "admin"];
        const dept = depts[Math.floor(Math.random() * depts.length)];
        const random = Math.floor(100 + Math.random() * 900);
        return `${dept}${random}`;
      },
      
      // ID-based corporate formats (commonly used in SSO systems)
      () => {
        const prefixes = ["id", "sso", "user", "auth", "login", "account"];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const random = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}.${random}`;
      },
      
      // Employee ID format (commonly accepted)
      () => {
        const prefix = "employee";
        const random = Math.floor(10000 + Math.random() * 90000);
        return `${prefix}${random}`;
      }
    ];
    
    // Select a random format generator and generate the email
    const formatGenerator = userFormats[Math.floor(Math.random() * userFormats.length)];
    const emailPrefix = formatGenerator();
    
    return `${emailPrefix}@${provider.domain}`;
  }

  // Generate a verification code in different formats that SSO systems use
  private generateVerificationCode(): string {
    // Different formats of SSO codes
    const codeFormats = [
      // 6-digit numeric
      () => Math.floor(100000 + Math.random() * 900000).toString(),
      // 8-digit numeric
      () => Math.floor(10000000 + Math.random() * 90000000).toString(),
      // Alphanumeric 6 characters
      () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      },
      // Format with dashes (XXX-XXX)
      () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let part1 = '';
        let part2 = '';
        for (let i = 0; i < 3; i++) {
          part1 += chars.charAt(Math.floor(Math.random() * chars.length));
          part2 += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `${part1}-${part2}`;
      }
    ];

    // Choose a random format
    const formatGenerator = codeFormats[Math.floor(Math.random() * codeFormats.length)];
    return formatGenerator();
  }

  // Simulate receiving an SSO verification message
  async simulateSSOVerification(emailAddress: string): Promise<any> {
    try {
      // Get or create the email address
      let tempEmail = await storage.getTempEmailByAddress(emailAddress);
      if (!tempEmail) {
        tempEmail = await storage.createTempEmail({ address: emailAddress });
      }

      // Generate verification code
      const verificationCode = this.generateVerificationCode();

      // Choose random SSO provider
      const providerIndex = Math.floor(Math.random() * SSOEmailService.ssoProviders.length);
      const provider = SSOEmailService.ssoProviders[providerIndex];

      // Create content using template
      const templateIndex = Math.floor(Math.random() * SSOEmailService.ssoVerificationTemplates.length);
      const template = SSOEmailService.ssoVerificationTemplates[templateIndex];
      const content = template.replace('{CODE}', verificationCode);

      // Create message object
      const message: InsertMessage = {
        emailId: tempEmail.id,
        sender: `verification@${provider.domain}`,
        senderName: `${provider.name} Authentication`,
        subject: "SSO Verification Code",
        content: content,
        otpCode: verificationCode,
      };

      // Store the message
      const savedMessage = await storage.createMessage(message);
      
      return savedMessage;
    } catch (error) {
      console.error('Error simulating SSO verification:', error);
      throw error;
    }
  }
}

export const ssoEmailService = new SSOEmailService();