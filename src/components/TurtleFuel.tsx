
import { type TurtleFuel as TurtleFuelType } from "@/types/turtle";
import { Battery } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface TurtleFuelProps {
  fuel: TurtleFuelType;
  isCollapsible?: boolean;
  defaultOpen?: boolean;
}

const TurtleFuel = ({ fuel, isCollapsible = false, defaultOpen = true }: TurtleFuelProps) => {
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
  
  const fuelContent = (
    <div className="space-y-4">
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
    </div>
  );
  
  if (isCollapsible) {
    return (
      <Collapsible defaultOpen={defaultOpen} className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl clip-edge">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center text-sm font-medium">
            <Battery className="h-4 w-4 mr-2" />
            Fuel Status
          </div>
          <CollapsibleTrigger className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <ChevronDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="p-4">
          {fuelContent}
        </CollapsibleContent>
      </Collapsible>
    );
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
        {fuelContent}
      </CardContent>
    </Card>
  );
};

export default TurtleFuel;
