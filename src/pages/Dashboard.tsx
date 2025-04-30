
import { useState, useEffect } from "react";
import { fetchAllTurtles, setApiBaseUrl } from "@/services/turtleApi";
import { Turtle } from "@/types/turtle";
import Header from "@/components/Header";
import TurtleCard from "@/components/TurtleCard";
import { useToast } from "@/hooks/use-toast";
import { useApiSettings } from "@/contexts/ApiSettingsContext";
import SettingsButton from "@/components/SettingsButton";

const Dashboard = () => {
  const [turtles, setTurtles] = useState<Turtle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { apiBaseUrl } = useApiSettings();

  // Update API base URL whenever it changes in the context
  useEffect(() => {
    setApiBaseUrl(apiBaseUrl);
  }, [apiBaseUrl]);
  
  const fetchTurtles = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllTurtles();
      setTurtles(data);
      if (data.length === 0) {
        toast({
          title: "No turtles found",
          description: "Make sure the turtle API server is running.",
        });
      }
    } catch (error) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onRefresh={fetchTurtles} isLoading={isLoading} />
      
      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Turtle Dashboard</h1>
          <SettingsButton />
        </div>
        
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
