
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { setApiBaseUrl } from "@/services/turtleApi";
import { Turtle, isTurtleOffline } from "@/types/turtle";
import { useToast } from "@/hooks/use-toast";
import { useApiSettings } from "@/contexts/ApiSettingsContext";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TurtleInfoPanel from "@/components/TurtleInfoPanel";
import TurtleInventory from "@/components/TurtleInventory";
import CommandPanel from "@/components/CommandPanel";
import SettingsButton from "@/components/SettingsButton";
import DebugPanel from "@/components/DebugPanel";
import TurtleSight from "@/components/TurtleSight";
import { useIsMobile } from "@/hooks/use-mobile";

// Define response type to avoid repetition
type ResponseData = {
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

const TurtleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const turtleId = parseInt(id || "0");
  const [turtle, setTurtle] = useState<Turtle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const isMobile = useIsMobile();
  
  // Track API and Command responses separately
  const [lastApiResponse, setLastApiResponse] = useState<ResponseData | null>(null);
  const [lastCommandResponse, setLastCommandResponse] = useState<ResponseData | null>(null);
  
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
          className: isMobile ? "max-w-[90vw]" : "",
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

  const handleSendCommand = async (command: string | string[], isLuaScript = false) => {
    try {
      // Mark as interacting during command send
      userInteracting.current = true;
      
      // Record timestamp of the request
      const timestamp = new Date().toISOString();
      
      const url = `${apiBaseUrl}/turtle/${turtleId}`;
      let body: string;
      let headers: Record<string, string>;
      
      if (Array.isArray(command)) {
        // Array of commands
        headers = { "Content-Type": "application/json" };
        body = JSON.stringify(command);
      } else if (isLuaScript) {
        // Lua script
        headers = { "Content-Type": "text/plain" };
        body = command;
      } else {
        // Single command as JSON array
        headers = { "Content-Type": "application/json" };
        body = JSON.stringify([command]);
      }
      
      const requestInfo = {
        method: "POST",
        headers,
        body,
      };
      
      const response = await fetch(url, requestInfo);
      
      if (!response.ok) {
        // Handle non-200 responses
        const errorInfo = {
          status: response.status,
          statusText: response.statusText,
          type: "HttpError",
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
          errorInfo,
          data: errorData,
        };
      }

      // Check if the response has a body before parsing
      const responseText = await response.text();
      const responseData = responseText ? JSON.parse(responseText) : null;

      const commandResponse: ResponseData = {
        data: responseData,
        timestamp,
        url,
        command,
        isLuaScript,
        requestInfo,
      };

      setLastCommandResponse(commandResponse);
      
      // Fetch the latest data right after sending a command
      setTimeout(() => {
        fetchTurtleData(false);
        userInteracting.current = false;
      }, 500);

      return Promise.resolve();
    } catch (error) {
      let errorInfo: any = {};
      let errorMessage = "";
      let errorData = null;
      
      if (error instanceof Error) {
        errorMessage = error.message;
        errorInfo.type = error.constructor.name;
        errorInfo.stack = error.stack;

        // For network errors (like DOMException)
        if ("code" in error) {
          errorInfo.code = (error as any).code;
        }
      } else if (typeof error === "object" && error !== null) {
        // Handle custom error objects we threw above
        errorMessage = (error as any).message || "Unknown error";
        errorInfo = (error as any).errorInfo || {};
        errorData = (error as any).data;
      } else {
        errorMessage = String(error);
      }

      // For fetch errors
      if (errorMessage === "Failed to fetch") {
        errorInfo.type = "NetworkError";
        errorInfo.details = "Connection to the server failed. The server might be down or unreachable.";
      }
      const commandErrorResponse: ResponseData = {
        data: errorData,
        error: errorMessage,
        errorInfo,
        timestamp: new Date().toISOString(),
        command,
        isLuaScript,
        url: `${apiBaseUrl}/turtle/${turtleId}`,
        requestInfo: {
          method: "POST",
          headers: isLuaScript
            ? { "Content-Type": "text/plain" }
            : { "Content-Type": "application/json" },
          body: typeof command === "string" && !isLuaScript
            ? JSON.stringify([command])
            : typeof command === "string"
            ? command
            : JSON.stringify(command),
        },
      };

      setLastCommandResponse(commandErrorResponse);

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

  // Handle selecting a turtle inventory slot
  const handleSelectSlot = (slot: number) => {
    // Minecraft slots are 1-indexed
    handleSendCommand(`turtle.select(${slot})`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 turtle-bg-pattern">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="flex items-center gap-2 text-blue-400 hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleDebugMode}
              className={`clip-edge-btn ${debugMode ? "bg-yellow-900 text-yellow-100" : "bg-gray-800 text-gray-200"}`}
            >
              {debugMode ? "Hide Debug" : "Show Debug"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              className="bg-gray-800 text-gray-200 clip-edge-btn"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isBackgroundLoading ? "animate-spin" : ""}`} />
            </Button>
            <SettingsButton />
          </div>
        </div>

        {debugMode && (
          <DebugPanel 
            apiResponse={lastApiResponse}
            commandResponse={lastCommandResponse}
            title="Debug Information"
          />
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-blue-400 font-medium">
              Loading turtle data...
            </div>
          </div>
        ) : turtle ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{turtle.name} <span className="text-gray-400">#{turtle.id}</span></h1>
                {isTurtleOffline(turtle) && (
                  <Badge variant="destructive" className="clip-edge-sm">Offline</Badge>
                )}
              </div>
            </div>

            {isMobile ? (
              // Mobile layout - Sight is integrated into the TurtleInfoPanel
              <div className="flex flex-col gap-4">
                {/* Info Panel with integrated Sight */}
                <div className="flex-1">
                  <TurtleInfoPanel 
                    turtle={turtle} 
                    onSendCommand={handleSendCommand} 
                  />
                </div>
                
                {/* Command Panel */}
                <CommandPanel 
                  turtleId={turtle.id} 
                  onSendCommand={handleSendCommand} 
                  className="clip-edge"
                />
                
                {/* Inventory */}
                {turtle.inventory && (
                  <TurtleInventory 
                    inventory={turtle.inventory} 
                    selectedSlot={turtle.selectedSlot} 
                    onSelectSlot={handleSelectSlot}
                    className="clip-edge"
                  />
                )}
              </div>
            ) : (
              // Desktop layout - Sight is separate
              <div className="grid grid-cols-12 gap-4">
                {/* Left Column - Info Panel */}
                <div className="col-span-4">
                  <TurtleInfoPanel 
                    turtle={turtle} 
                    onSendCommand={handleSendCommand} 
                  />
                </div>
                
                {/* Middle Column - Sight Blocks */}
                <div className="col-span-1 flex justify-center items-start">
                  {turtle.sight && <TurtleSight sight={turtle.sight} />}
                </div>
                
                {/* Right Column - Command Panel & Inventory */}
                <div className="col-span-7 flex flex-col gap-4">
                  <CommandPanel 
                    turtleId={turtle.id} 
                    onSendCommand={handleSendCommand}
                    className="h-full clip-edge" 
                  />
                  
                  {turtle.inventory && (
                    <TurtleInventory 
                      inventory={turtle.inventory} 
                      selectedSlot={turtle.selectedSlot} 
                      onSelectSlot={handleSelectSlot}
                      className="clip-edge"
                    />
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-700 clip-edge">
            <h2 className="text-xl font-semibold mb-2">Turtle Not Found</h2>
            <p className="text-gray-400 mb-4">
              Could not find turtle with ID {turtleId}
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-500 clip-edge-btn">
              <Link to="/">Return to Dashboard</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TurtleDetail;
