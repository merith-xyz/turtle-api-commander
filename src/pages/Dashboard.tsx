
import { useState, useEffect } from "react";
import { fetchAllTurtles, setApiBaseUrl } from "@/services/turtleApi";
import { Turtle } from "@/types/turtle";
import Header from "@/components/Header";
import TurtleCard from "@/components/TurtleCard";
import { useToast } from "@/hooks/use-toast";
import { useApiSettings } from "@/contexts/ApiSettingsContext";
import SettingsButton from "@/components/SettingsButton";
import DebugPanel from "@/components/DebugPanel";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [turtles, setTurtles] = useState<Turtle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<{data: any, error?: string, timestamp: string, url?: string} | null>(null);
  const [debugMode, setDebugMode] = useState<boolean>(() => {
    return localStorage.getItem('debugMode') === 'true';
  });
  const { toast } = useToast();
  const { apiBaseUrl } = useApiSettings();

  // Update API base URL whenever it changes in the context
  useEffect(() => {
    setApiBaseUrl(apiBaseUrl);
  }, [apiBaseUrl]);
  
  const fetchTurtles = async () => {
    setIsLoading(true);
    try {
      // Record timestamp of the request
      const timestamp = new Date().toISOString();
      
      // Making the API call
      const url = `${apiBaseUrl}/turtle`;
      const response = await fetch(url);
      const responseData = await response.json();
      
      // Store the full response for debugging
      setLastResponse({
        data: responseData,
        timestamp: timestamp,
        url: url
      });
      
      // Update the turtles state with the data
      setTurtles(responseData);
      
      if (responseData.length === 0) {
        toast({
          title: "No turtles found",
          description: "Make sure the turtle API server is running.",
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
        title: "Failed to fetch turtles",
        description: "Could not connect to the turtle API.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTurtles();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchTurtles, 5000);
    return () => clearInterval(interval);
  }, [apiBaseUrl]); // Re-fetch when API URL changes

  const toggleDebugMode = () => {
    const newMode = !debugMode;
    setDebugMode(newMode);
    localStorage.setItem('debugMode', newMode.toString());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onRefresh={fetchTurtles} isLoading={isLoading} />
      
      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Turtle Dashboard</h1>
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
            title={`API Response (${lastResponse.timestamp})`} 
          />
        )}
        
        {isLoading && turtles.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-primary font-medium">
              Loading turtles...
            </div>
          </div>
        ) : turtles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {turtles.map((turtle) => (
              <TurtleCard key={turtle.id} turtle={turtle} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No turtles found</h2>
            <p className="text-muted-foreground mb-4">
              Make sure the turtle API server is running at {apiBaseUrl.replace('/api', '')}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
