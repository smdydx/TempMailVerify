import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import EmailGenerator from '@/components/EmailGenerator';
import InboxContainer from '@/components/InboxContainer';
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const { toast } = useToast();

  // Set initial email on first load
  useEffect(() => {
    // Get the email from local storage if exists
    const savedEmail = localStorage.getItem('tempmail_current_email');
    if (savedEmail) {
      setCurrentEmail(savedEmail);
    }
  }, []);

  // Save current email to local storage when it changes
  useEffect(() => {
    if (currentEmail) {
      localStorage.setItem('tempmail_current_email', currentEmail);
    }
  }, [currentEmail]);

  const handleEmailGenerate = () => {
    toast({
      title: "Email Generated",
      description: "Your temporary email address is ready to use."
    });
  };

  const handleMessageSimulated = () => {
    toast({
      title: "Message Received",
      description: "A new verification message has arrived."
    });
  };

  return (
    <div className="bg-gray-50 font-sans text-gray-800 min-h-screen">
      <Helmet>
        <title>TempMail - Temporary Gmail OTP Receiver</title>
        <meta name="description" content="Create temporary disposable email addresses to receive OTPs and verification messages instantly. Secure and easy to use." />
        <meta property="og:title" content="TempMail - Temporary Gmail OTP Receiver" />
        <meta property="og:description" content="Generate temporary email addresses for receiving OTPs and verification codes from various services." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-800">TempMail</h1>
            </div>
            <div className="text-sm text-gray-500">Temporary OTP & SSO Email Service</div>
          </div>
        </header>

        {/* Main Content */}
        <>
          {/* Email Generator Section */}
          <EmailGenerator 
            currentEmail={currentEmail} 
            setCurrentEmail={setCurrentEmail} 
            onGenerate={handleEmailGenerate} 
          />

          {/* Inbox Section */}
          <InboxContainer 
            currentEmail={currentEmail} 
            onSimulateMessage={handleMessageSimulated}
          />
        </>

        {/* Footer Section */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} TempMail. All rights reserved.</p>
          <p className="mt-1">Temporary email service for OTP and verification messages</p>
        </footer>
      </div>
    </div>
  );
}
