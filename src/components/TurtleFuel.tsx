
import { type TurtleFuel as TurtleFuelType } from "@/types/turtle";
import { Battery } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TurtleFuelProps {
  fuel: TurtleFuelType;
}

const TurtleFuel = ({ fuel }: TurtleFuelProps) => {
  const fuelPercentage = (fuel.current / fuel.max) * 100;
  
  let fuelStatus = "Low";
  let statusColor = "text-red-500";
  
  if (fuelPercentage > 70) {
    fuelStatus = "Good";
    statusColor = "text-green-500";
  } else if (fuelPercentage > 30) {
    fuelStatus = "Moderate";
    statusColor = "text-yellow-500";
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Battery className="h-5 w-5" />
          Fuel Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            {fuel.current} / {fuel.max}
          </span>
          <span className={`font-medium ${statusColor}`}>{fuelStatus}</span>
        </div>
        <Progress value={fuelPercentage} className="h-2" />
        <div className="text-xs text-muted-foreground">
          {fuelPercentage.toFixed(1)}% remaining
        </div>
      </CardContent>
    </Card>
  );
};

export default TurtleFuel;
