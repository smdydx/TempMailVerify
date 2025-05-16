import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { formatRelativeTime } from '@/lib/emailUtils';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface MessageItemProps {
  id: number;
  senderName: string;
  sender: string;
  content: string;
  receivedAt: string;
  otpCode: string | null;
  emailAddress: string;
}

export default function MessageItem({
  id,
  senderName,
  sender,
  content,
  receivedAt,
  otpCode,
  emailAddress
}: MessageItemProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const queryClient = useQueryClient();
  
  const receivedDate = new Date(receivedAt);
  const relativeTime = formatRelativeTime(receivedDate);

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PATCH', `/api/messages/${id}/read`, {});
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/email/${emailAddress}/messages`] });
    }
  });

  const copyOTPToClipboard = async () => {
    if (!otpCode) return;
    
    try {
      await navigator.clipboard.writeText(otpCode);
      setIsCopied(true);
      
      // Mark message as read when OTP is copied
      markAsReadMutation.mutate();

      toast({
        title: "OTP Copied!",
        description: "OTP code copied to clipboard",
      });
      
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy OTP code",
        variant: "destructive",
      });
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <div className="p-6 hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-medium">{senderName}</div>
          <div className="text-sm text-gray-500">{sender}</div>
        </div>
        <div className="text-xs text-gray-500">{relativeTime}</div>
      </div>
      <div className="text-gray-700 text-sm mb-3">
        {content}
      </div>
      {otpCode && (
        <div className="otp-highlight p-3 rounded-md bg-gradient-to-r from-indigo-50 to-indigo-50/50 border-l-3 border-indigo-500">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-500 uppercase font-medium mb-1">OTP Code</div>
              <div className="text-lg font-semibold">{otpCode}</div>
            </div>
            <Button
              onClick={copyOTPToClipboard}
              variant={isCopied ? "default" : "outline"}
              className={`
                text-sm px-3 py-1 h-auto
                ${isCopied ? 'bg-green-500 text-white border-green-500' : 'bg-white text-primary border-primary'}
              `}
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 mr-1" /> Copied
                </>
              ) : (
                'Copy'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
