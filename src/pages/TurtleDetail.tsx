
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchTurtle, sendTurtleCommand, setApiBaseUrl } from "@/services/turtleApi";
import { Turtle } from "@/types/turtle";
import { useToast } from "@/hooks/use-toast";
import { useApiSettings } from "@/contexts/ApiSettingsContext";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TurtlePosition from "@/components/TurtlePosition";
import TurtleFuel from "@/components/TurtleFuel";
import TurtleInventory from "@/components/TurtleInventory";
import CommandPanel from "@/components/CommandPanel";
import SettingsButton from "@/components/SettingsButton";
import DebugPanel from "@/components/DebugPanel";

const TurtleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const turtleId = parseInt(id || "0");
  const [turtle, setTurtle] = useState<Turtle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<{
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
    command?: string,
    requestInfo?: {
      method: string,
      headers?: Record<string, string>,
      body?: string
    }
  } | null>(null);
  const [debugMode, setDebugMode] = useState<boolean>(() => {
    return localStorage.getItem('debugMode') === 'true';
  });
  
  // Use a ref to track user interaction
  const userInteracting = useRef(false);
  const pollingTimeoutRef = useRef<number | null>(null);
  
  const { toast } = useToast();
  const { apiBaseUrl } = useApiSettings();

  useEffect(() => {
    // Dynamically update the API base URL in turtleApi
    setApiBaseUrl(apiBaseUrl);
  }, [apiBaseUrl]);

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
      setLastResponse({
        data: responseData,
        timestamp: timestamp,
        url: url,
        requestInfo: requestInfo
      });
      
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
      let errorInfo: any = {}; // Changed from const to let
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
      setLastResponse({
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
      });
      
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

  const handleSendCommand = async (command: string) => {
    try {
      // Mark as interacting during command send
      userInteracting.current = true;
      
      const url = `${apiBaseUrl}/turtle/${turtleId}/command`;
      const body = JSON.stringify({ command });
      const requestInfo = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body
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
      
      // Store the command response for debugging
      setLastResponse({
        data: responseData,
        timestamp: new Date().toISOString(),
        url: url,
        command: command,
        requestInfo: requestInfo
      });
      
      // Fetch the latest data right after sending a command
      setTimeout(() => {
        fetchTurtleData(false);
        userInteracting.current = false;
      }, 500);
      
      return Promise.resolve();
    } catch (error) {
      // Capture detailed error information
      let errorInfo: any = {}; // Changed from const to let
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
      
      // Store the error for debugging
      setLastResponse({
        data: errorData,
        error: errorMessage,
        errorInfo: errorInfo,
        timestamp: new Date().toISOString(),
        command: command,
        url: `${apiBaseUrl}/turtle/${turtleId}/command`,
        requestInfo: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ command })
        }
      });
      
      // End interaction state
      userInteracting.current = false;
      
      return Promise.reject(error);
    }
  };

  const toggleDebugMode = () => {
    const newMode = !debugMode;
    setDebugMode(newMode);
    localStorage.setItem('debugMode', newMode.toString());
  };

  // Function to manually refresh data
  const handleManualRefresh = () => {
    fetchTurtleData(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleDebugMode}
              className={debugMode ? "bg-yellow-100" : ""}
            >
              {debugMode ? "Hide Debug" : "Show Debug"}
            </Button>
            <SettingsButton />
          </div>
        </div>

        {debugMode && lastResponse && (
          <DebugPanel 
            data={lastResponse} 
            title={lastResponse.command 
              ? `Command Response (${lastResponse.timestamp})` 
              : `API Response (${lastResponse.timestamp})`} 
          />
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-primary font-medium">
              Loading turtle data...
            </div>
          </div>
        ) : turtle ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Turtle {turtle.name} (#{turtle.id})</h1>
              <div className="flex items-center gap-2">
                {isBackgroundLoading && (
                  <div className="text-xs text-muted-foreground animate-pulse">
                    Updating...
                  </div>
                )}
                <Button variant="outline" onClick={handleManualRefresh}>
                  Refresh
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {turtle.pos && <TurtlePosition position={turtle.pos} />}
              {turtle.fuel && <TurtleFuel fuel={turtle.fuel} />}
              <CommandPanel turtleId={turtle.id} onSendCommand={handleSendCommand} />
            </div>

            {turtle.inventory && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Inventory</h2>
                <TurtleInventory inventory={turtle.inventory} selectedSlot={turtle.selectedSlot} />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Turtle Not Found</h2>
            <p className="text-muted-foreground mb-4">
              Could not find turtle with ID {turtleId}
            </p>
            <Button asChild>
              <Link to="/">Return to Dashboard</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TurtleDetail;
