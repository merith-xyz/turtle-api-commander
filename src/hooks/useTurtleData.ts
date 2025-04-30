
import { useState, useEffect, useRef } from "react";
import { Turtle } from "@/types/turtle";
import { useToast } from "@/hooks/use-toast";

// Define response type to avoid repetition
export type ResponseData = {
  data: any, 
  error?: string, 
  errorInfo?: {
    status?: number,
    statusText?: string,
    type?: string,
    stack?: string,
    code?: string,
    details?: string
  },
  timestamp: string, 
  url?: string,
  command?: string | string[],
  isLuaScript?: boolean,
  requestInfo?: {
    method: string,
    headers?: Record<string, string>,
    body?: string
  }
};

interface UseTurtleDataProps {
  turtleId: number;
  apiBaseUrl: string;
}

export const useTurtleData = ({ turtleId, apiBaseUrl }: UseTurtleDataProps) => {
  const [turtle, setTurtle] = useState<Turtle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [lastApiResponse, setLastApiResponse] = useState<ResponseData | null>(null);
  const [lastCommandResponse, setLastCommandResponse] = useState<ResponseData | null>(null);
  
  // Use a ref to track user interaction
  const userInteracting = useRef(false);
  const pollingTimeoutRef = useRef<number | null>(null);
  
  const { toast } = useToast();

  const fetchTurtleData = async (isInitialLoad = false) => {
    // Only show full loading state on initial load
    if (isInitialLoad) {
      setIsLoading(true);
    } else {
      setIsBackgroundLoading(true);
    }
    
    try {
      // Record timestamp of the request
      const timestamp = new Date().toISOString();
      
      // Making the API call
      const url = `${apiBaseUrl}/turtle/${turtleId}`;
      const requestInfo = {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };
      
      const response = await fetch(url, requestInfo);
      
      if (!response.ok) {
        // Handle non-200 responses
        const errorInfo = {
          status: response.status,
          statusText: response.statusText,
          type: 'HttpError'
        };
        
        let errorData;
        try {
          // Try to parse error response as JSON
          errorData = await response.json();
        } catch (e) {
          // If can't parse as JSON, use text
          errorData = await response.text();
        }
        
        throw {
          message: `HTTP error ${response.status}: ${response.statusText}`,
          errorInfo: errorInfo,
          data: errorData
        };
      }
      
      const responseData = await response.json();
      
      // Store the full response for debugging
      const apiResponse: ResponseData = {
        data: responseData,
        timestamp: timestamp,
        url: url,
        requestInfo: requestInfo
      };
      
      setLastApiResponse(apiResponse);
      
      // Update the turtle state with the data, preserving the reference if data hasn't changed
      setTurtle(prevTurtle => {
        if (!prevTurtle || JSON.stringify(prevTurtle) !== JSON.stringify(responseData)) {
          return responseData;
        }
        return prevTurtle;
      });
      
      if (!responseData) {
        toast({
          title: "Turtle not found",
          description: `Could not find turtle with ID ${turtleId}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      // Capture detailed error information
      let errorInfo: any = {}; 
      let errorMessage = '';
      let errorData = null;
      
      if (error instanceof Error) {
        errorMessage = error.message;
        errorInfo.type = error.constructor.name;
        errorInfo.stack = error.stack;
        
        // For network errors (like DOMException)
        if ('code' in error) {
          errorInfo.code = (error as any).code;
        }
      } else if (typeof error === 'object' && error !== null) {
        // Handle custom error objects we threw above
        errorMessage = (error as any).message || 'Unknown error';
        errorInfo = (error as any).errorInfo || {};
        errorData = (error as any).data;
      } else {
        errorMessage = String(error);
      }
      
      // For fetch errors
      if (errorMessage === 'Failed to fetch') {
        errorInfo.type = 'NetworkError';
        errorInfo.details = 'Connection to the server failed. The server might be down or unreachable.';
      }
      
      // Store the detailed error for debugging
      const apiErrorResponse: ResponseData = {
        data: errorData,
        error: errorMessage,
        errorInfo: errorInfo,
        timestamp: new Date().toISOString(),
        url: `${apiBaseUrl}/turtle/${turtleId}`,
        requestInfo: {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }
      };
      
      setLastApiResponse(apiErrorResponse);
      
      // Only show toast on initial load to avoid spamming
      if (isInitialLoad) {
        toast({
          title: "Error",
          description: "Failed to fetch turtle data",
          variant: "destructive",
        });
      }
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      } else {
        setIsBackgroundLoading(false);
      }
    }
  };

  // Function to schedule the next polling interval
  const scheduleNextPoll = () => {
    // Clear any existing timeout
    if (pollingTimeoutRef.current !== null) {
      clearTimeout(pollingTimeoutRef.current);
    }
    
    // Only poll if the user isn't actively interacting
    if (!userInteracting.current) {
      pollingTimeoutRef.current = window.setTimeout(() => {
        fetchTurtleData(false);
        scheduleNextPoll();
      }, 2000);
    } else {
      // If user is interacting, check again shortly
      pollingTimeoutRef.current = window.setTimeout(() => {
        scheduleNextPoll();
      }, 500);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchTurtleData(true);
    
    // Start polling
    scheduleNextPoll();
    
    // Set up global interaction listeners
    const startInteraction = () => {
      userInteracting.current = true;
    };
    
    const endInteraction = () => {
      userInteracting.current = false;
      // Fetch latest data when user stops interacting
      fetchTurtleData(false);
    };
    
    // Mouse and touch events for detecting interaction
    document.addEventListener('mousedown', startInteraction);
    document.addEventListener('touchstart', startInteraction);
    document.addEventListener('mouseup', endInteraction);
    document.addEventListener('touchend', endInteraction);
    
    // Cleanup function
    return () => {
      if (pollingTimeoutRef.current !== null) {
        clearTimeout(pollingTimeoutRef.current);
      }
      document.removeEventListener('mousedown', startInteraction);
      document.removeEventListener('touchstart', startInteraction);
      document.removeEventListener('mouseup', endInteraction);
      document.removeEventListener('touchend', endInteraction);
    };
  }, [turtleId, apiBaseUrl]);

  return {
    turtle,
    isLoading,
    isBackgroundLoading,
    lastApiResponse,
    lastCommandResponse,
    setLastCommandResponse,
    fetchTurtleData,
    userInteracting
  };
};
