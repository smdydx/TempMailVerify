import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock, Info, Inbox } from "lucide-react";
import MessageItem from "./MessageItem";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatLastRefreshed } from '@/lib/emailUtils';
import { useWebSocket } from '@/hooks/useWebSocket';

interface Message {
  id: number;
  emailId: number;
  sender: string;
  senderName: string;
  subject: string;
  content: string;
  otpCode: string | null;
  receivedAt: string;
  isRead: boolean;
}

interface InboxContainerProps {
  currentEmail: string;
  onSimulateMessage: () => void;
}

export default function InboxContainer({ 
  currentEmail, 
  onSimulateMessage 
}: InboxContainerProps) {
  const { toast } = useToast();
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  // Determine the WebSocket URL based on the current origin
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  // Setup WebSocket connection
  const { sendMessage, lastMessage, connectionStatus } = useWebSocket(wsUrl);

  // Subscribe to updates for this email
  useEffect(() => {
    if (connectionStatus === 'open' && currentEmail) {
      sendMessage({
        type: 'SUBSCRIBE_EMAIL',
        emailAddress: currentEmail
      });
    }
  }, [currentEmail, connectionStatus, sendMessage]);

  // Listen for WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'NEW_MESSAGE') {
      if (lastMessage.emailAddress === currentEmail) {
        // Invalidate query to refresh messages
        refetch();
        setLastRefreshed(new Date());
        
        toast({
          title: "New Message",
          description: `New message received from ${lastMessage.message.senderName}`,
        });
      }
    }
  }, [lastMessage]);

  // Set up auto-refresh
  useEffect(() => {
    if (currentEmail && !refreshInterval) {
      const interval = window.setInterval(() => {
        refetch();
        setLastRefreshed(new Date());
      }, 30000); // 30 seconds
      
      setRefreshInterval(interval);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    };
  }, [currentEmail]);

  // Fetch messages for the current email
  // Define the type for the expected response
  interface MessagesResponse {
    success: boolean;
    messages: Message[];
  }

  const { 
    data, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery<MessagesResponse>({
    queryKey: [`/api/email/${currentEmail}/messages`],
    enabled: !!currentEmail,
    refetchOnWindowFocus: false,
  });

  const handleRefresh = () => {
    refetch();
    setLastRefreshed(new Date());
    toast({
      title: "Refreshed",
      description: "Inbox refreshed successfully",
    });
  };

  // Generate a simulated message for testing
  const simulateMessage = async (messageType = 'normal') => {
    if (!currentEmail) return;
    
    try {
      const response = await apiRequest('POST', '/api/simulate/receive', {
        emailAddress: currentEmail,
        type: messageType
      });
      
      if (response.ok) {
        refetch();
        setLastRefreshed(new Date());
        onSimulateMessage();
      }
    } catch (error) {
      console.error('Error simulating message:', error);
    }
  };
  
  const handleSimulateOTP = () => simulateMessage('normal');
  const handleSimulateSSO = () => simulateMessage('sso');

  // Type cast data to MessagesResponse type when it exists
  const responseData = data as MessagesResponse | undefined;
  const messages = responseData?.success && responseData.messages ? responseData.messages : [];
  const hasMessages = messages.length > 0;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Inbox</h2>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-5 w-5 mr-1" />
            <span>
              {lastRefreshed ? formatLastRefreshed(lastRefreshed) : 'Never refreshed'}
            </span>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-2">
          Receive OTPs and verification messages instantly. Auto-refreshes every 30 seconds.
        </p>
      </div>

      {/* No Email Selected State */}
      {!currentEmail && (
        <div className="py-12 px-6 text-center">
          <Inbox className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No email address selected</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Generate a temporary email address above to start receiving messages.
          </p>
        </div>
      )}

      {/* Loading State */}
      {currentEmail && isLoading && (
        <div className="py-12 px-6 text-center">
          <div className="animate-pulse flex justify-center mb-4">
            <RefreshCw className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Checking for messages</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Please wait while we check for new messages...
          </p>
        </div>
      )}

      {/* Error State */}
      {currentEmail && isError && (
        <div className="py-12 px-6 text-center">
          <div className="flex justify-center mb-4">
            <Info className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Error loading messages</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-4">
            There was a problem loading your messages. Please try refreshing.
          </p>
          <Button onClick={handleRefresh}>Refresh Inbox</Button>
        </div>
      )}

      {/* No Messages State */}
      {currentEmail && !isLoading && !isError && !hasMessages && (
        <div className="py-12 px-6 text-center">
          <Inbox className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your inbox is empty</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Use your temporary email address for signing up or verification. 
            Messages will appear here automatically.
          </p>
          <div className="flex flex-col space-y-4">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="flex items-center w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> 
              Refresh Inbox
            </Button>
            
            {/* Simulation buttons for testing */}
            <div className="flex justify-center space-x-2">
              <Button 
                onClick={handleSimulateOTP}
                className="flex-1"
              >
                Simulate OTP Message
              </Button>
              <Button 
                onClick={handleSimulateSSO}
                variant="secondary"
                className="flex-1"
              >
                Simulate SSO Verification
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      {currentEmail && !isLoading && !isError && hasMessages && (
        <div className="divide-y divide-gray-200">
          {messages.map((message: Message) => (
            <MessageItem 
              key={message.id}
              id={message.id}
              senderName={message.senderName}
              sender={message.sender}
              content={message.content}
              receivedAt={message.receivedAt}
              otpCode={message.otpCode}
              emailAddress={currentEmail}
            />
          ))}
        </div>
      )}

      {/* Auto-refresh Notice */}
      <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500 flex items-center justify-center">
        <Info className="h-4 w-4 mr-2" />
        <span>Inbox automatically refreshes every 30 seconds</span>
      </div>
    </Card>
  );
}
