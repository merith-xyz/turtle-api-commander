
import { useState, useEffect } from "react";
import { fetchAllTurtles } from "@/services/turtleApi";
import { Turtle } from "@/types/turtle";
import Header from "@/components/Header";
import TurtleCard from "@/components/TurtleCard";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const [turtles, setTurtles] = useState<Turtle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onRefresh={fetchTurtles} isLoading={isLoading} />
      
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Turtle Dashboard</h1>
        
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
              Make sure the turtle API server is running at localhost:3300
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
