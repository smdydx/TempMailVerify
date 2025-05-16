import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import EmailTypeSelector from './EmailTypeSelector';

interface EmailGeneratorProps {
  currentEmail: string;
  setCurrentEmail: (email: string) => void;
  onGenerate: () => void;
}

export default function EmailGenerator({ 
  currentEmail, 
  setCurrentEmail, 
  onGenerate 
}: EmailGeneratorProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [emailType, setEmailType] = useState<string>('gmail');

  const generateEmailMutation = useMutation({
    mutationFn: async () => {
      const endpoint = emailType === 'sso' 
        ? '/api/email/generate-sso'
        : '/api/email/generate';
        
      const response = await apiRequest('POST', endpoint, {});
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      if (data.success && data.email) {
        setCurrentEmail(data.email.address);
        onGenerate();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate email address. Please try again.",
        variant: "destructive",
      });
      console.error('Error generating email:', error);
    }
  });

  const handleGenerateEmail = () => {
    generateEmailMutation.mutate();
  };

  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentEmail);
      setIsCopied(true);
      toast({
        title: "Copied!",
        description: "Email address copied to clipboard",
      });
      setTimeout(() => setIsCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy email address",
        variant: "destructive",
      });
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <Card className="overflow-hidden mb-8">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Your Temporary Email</h2>
        
        <EmailTypeSelector 
          currentType={emailType} 
          onTypeChange={setEmailType} 
        />
        
        <div className="mb-6">
          <div className="flex items-center">
            <div className="flex-1 bg-accent p-4 rounded-l-md font-medium text-gray-700 border border-r-0 border-gray-200 overflow-auto">
              {currentEmail || "Generate an email address"}
            </div>
            <Button 
              className="rounded-l-none bg-primary text-white p-4 h-[56px] hover:bg-indigo-700"
              onClick={copyEmailToClipboard}
              disabled={!currentEmail}
            >
              <Copy className="h-5 w-5" />
            </Button>
          </div>
          {isCopied && (
            <div className="mt-2 text-sm text-green-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Email address copied to clipboard!
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          <Button 
            className="flex-1 bg-primary text-white py-3 px-6 hover:bg-indigo-700 flex items-center justify-center"
            onClick={handleGenerateEmail}
            disabled={generateEmailMutation.isPending}
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${generateEmailMutation.isPending ? 'animate-spin' : ''}`} />
            {generateEmailMutation.isPending ? 'Generating...' : 'Generate New Email'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
