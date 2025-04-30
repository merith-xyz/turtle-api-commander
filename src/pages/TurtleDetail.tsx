
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTurtle, sendTurtleCommand } from "@/services/turtleApi";
import { Turtle } from "@/types/turtle";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import TurtleInventory from "@/components/TurtleInventory";
import TurtlePosition from "@/components/TurtlePosition";
import TurtleFuel from "@/components/TurtleFuel";
import CommandPanel from "@/components/CommandPanel";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const TurtleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [turtle, setTurtle] = useState<Turtle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const turtleId = id ? parseInt(id, 10) : -1;

  const fetchTurtleData = async () => {
    if (turtleId < 0) {
      navigate("/");
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchTurtle(turtleId);
      if (data) {
        setTurtle(data);
      } else {
        toast({
          title: "Turtle not found",
          description: `Could not find turtle with ID ${turtleId}`,
          variant: "destructive",
        });
        navigate("/");
      }
    } catch (error) {
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
    
    // Poll for updates every 3 seconds
    const interval = setInterval(fetchTurtleData, 3000);
    return () => clearInterval(interval);
  }, [turtleId]);

  const handleSendCommand = async (command: string) => {
    if (!turtle) return;
    
    await sendTurtleCommand(turtle.id, command);
    // Refresh turtle data immediately to see the effects of the command
    fetchTurtleData();
  };

  if (!turtle && !isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onRefresh={fetchTurtleData} isLoading={isLoading} />
      
      <main className="container mx-auto p-4">
        <div className="mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-2xl font-bold">
            {turtle ? `${turtle.name || `Turtle #${turtle.id}`}` : "Loading..."}
          </h1>
        </div>
        
        {isLoading && !turtle ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-primary font-medium">
              Loading turtle data...
            </div>
          </div>
        ) : turtle ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Turtle Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TurtlePosition position={turtle.pos} />
                <TurtleFuel fuel={turtle.fuel} />
              </div>
              
              {/* Inventory */}
              <TurtleInventory 
                inventory={turtle.inventory} 
                selectedSlot={turtle.selectedSlot} 
              />
            </div>
            
            {/* Command Panel */}
            <div>
              <CommandPanel 
                turtleId={turtle.id} 
                onSendCommand={handleSendCommand}
              />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default TurtleDetail;
