import { useEffect, useRef, useState, useCallback } from 'react';

type MessageHandler = (data: any) => void;

interface WebSocketHook {
  sendMessage: (data: object) => void;
  lastMessage: any;
  connectionStatus: 'connecting' | 'open' | 'closed' | 'error';
}

export function useWebSocket(url: string): WebSocketHook {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Initialize WebSocket connection
  const connectWebSocket = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      setConnectionStatus('connecting');

      ws.onopen = () => {
        console.log('WebSocket connection established');
        setConnectionStatus('open');
      };

      ws.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          setLastMessage(parsedData);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setConnectionStatus('closed');
        
        // Setup reconnection
        if (reconnectTimeoutRef.current === null) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connectWebSocket();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [url]);

  // Send message through WebSocket
  const sendMessage = useCallback((data: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, []);

  // Initialize connection when component mounts
  useEffect(() => {
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  return { sendMessage, lastMessage, connectionStatus };
}
