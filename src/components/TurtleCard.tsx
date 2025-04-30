
import { Turtle, isTurtleOffline } from "@/types/turtle";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Battery, Box, MapPin, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface TurtleCardProps {
  turtle: Turtle;
}

const TurtleCard = ({ turtle }: TurtleCardProps) => {
  const navigate = useNavigate();
  const fuelPercentage = (turtle.fuel.current / turtle.fuel.max) * 100;
  const isOffline = isTurtleOffline(turtle);
  
  // Count non-empty inventory slots
  const inventoryItems = turtle.inventory.filter(item => item.count && item.count > 0).length;
  const heartbeatDate = new Date(turtle.heartbeat * 1000);
  const lastSeen = formatDistanceToNow(heartbeatDate, { addSuffix: true });
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>{turtle.name || `Turtle #${turtle.id}`}</span>
            {isOffline && (
              <Badge variant="destructive" className="text-xs">Offline</Badge>
            )}
          </div>
          <span className="text-sm font-normal text-muted-foreground">ID: {turtle.id}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            X: {turtle.pos.x}, Y: {turtle.pos.y}, Z: {turtle.pos.z} ({turtle.pos.rname})
          </span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Fuel</span>
            </div>
            <span className="text-xs font-medium">
              {turtle.fuel.current} / {turtle.fuel.max}
            </span>
          </div>
          <Progress value={fuelPercentage} className="h-2" />
        </div>
        
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{inventoryItems} items in inventory</span>
        </div>
        
        {isOffline && (
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Last seen {lastSeen}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => navigate(`/turtle/${turtle.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TurtleCard;
