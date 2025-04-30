
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchTurtle, sendTurtleCommand } from "@/services/turtleApi";
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
  const [lastResponse, setLastResponse] = useState<{data: any, error?: string, timestamp: string, url?: string} | null>(null);
  const [debugMode, setDebugMode] = useState<boolean>(() => {
    return localStorage.getItem('debugMode') === 'true';
  });
  const { toast } = useToast();
  const { apiBaseUrl } = useApiSettings();

  useEffect(() => {
    // Dynamically update the API base URL in turtleApi
    setApiBaseUrl(apiBaseUrl);
  }, [apiBaseUrl]);

  const fetchTurtleData = async () => {
    setIsLoading(true);
    try {
      // Record timestamp of the request
      const timestamp = new Date().toISOString();
      
      // Making the API call
      const url = `${apiBaseUrl}/turtle/${turtleId}`;
      const response = await fetch(url);
      const responseData = await response.json();
      
      // Store the full response for debugging
      setLastResponse({
        data: responseData,
        timestamp: timestamp,
        url: url
      });
      
      // Update the turtle state with the data
      setTurtle(responseData);
      
      if (!responseData) {
        toast({
          title: "Turtle not found",
          description: `Could not find turtle with ID ${turtleId}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      // Store the error for debugging
      setLastResponse({
        data: null,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Error",
        description: "Failed to fetch turtle data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTurtleData();
    
    // Poll for updates every 2 seconds
    const interval = setInterval(fetchTurtleData, 2000);
    return () => clearInterval(interval);
  }, [turtleId, apiBaseUrl]);

  const handleSendCommand = async (command: string) => {
    try {
      const url = `${apiBaseUrl}/turtle/${turtleId}/command`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command }),
      });
      
      const responseData = await response.json();
      
      // Store the command response for debugging
      setLastResponse({
        data: responseData,
        timestamp: new Date().toISOString(),
        url: url,
        command: command
      });
      
      // Fetch the latest data right after sending a command
      setTimeout(fetchTurtleData, 500);
      return Promise.resolve();
    } catch (error) {
      // Store the error for debugging
      setLastResponse({
        data: null,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        command: command
      });
      
      return Promise.reject(error);
    }
  };

  const toggleDebugMode = () => {
    const newMode = !debugMode;
    setDebugMode(newMode);
    localStorage.setItem('debugMode', newMode.toString());
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
              <Button variant="outline" onClick={fetchTurtleData}>
                Refresh
              </Button>
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
