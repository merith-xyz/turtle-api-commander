
import { type TurtlePosition as TurtlePositionType } from "@/types/turtle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface TurtlePositionProps {
  position: TurtlePositionType;
  isCollapsible?: boolean;
  defaultOpen?: boolean;
}

const TurtlePosition = ({ position, isCollapsible = false, defaultOpen = true }: TurtlePositionProps) => {
  const getDirectionIcon = () => {
    switch (position.rname.toLowerCase()) {
      case "north":
        return <ArrowUp className="h-6 w-6" />;
      case "south":
        return <ArrowDown className="h-6 w-6" />;
      case "east":
        return <ArrowRight className="h-6 w-6" />;
      case "west":
        return <ArrowLeft className="h-6 w-6" />;
      default:
        return null;
    }
  };

  const positionContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="border rounded-md p-2">
          <div className="text-xs text-muted-foreground">X</div>
          <div className="font-medium">{position.x}</div>
        </div>
        <div className="border rounded-md p-2">
          <div className="text-xs text-muted-foreground">Y</div>
          <div className="font-medium">{position.y}</div>
        </div>
        <div className="border rounded-md p-2">
          <div className="text-xs text-muted-foreground">Z</div>
          <div className="font-medium">{position.z}</div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="border rounded-full p-4 w-16 h-16 flex items-center justify-center">
          {getDirectionIcon()}
        </div>
      </div>
      
      <div className="text-center text-sm">
        Facing: <span className="font-medium capitalize">{position.rname}</span>
      </div>
    </div>
  );

  if (isCollapsible) {
    return (
      <Collapsible defaultOpen={defaultOpen} className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl clip-edge">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center text-sm font-medium">
            <span>Position</span>
          </div>
          <CollapsibleTrigger className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <ChevronDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="p-4">
          {positionContent}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Position</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {positionContent}
      </CardContent>
    </Card>
  );
};

export default TurtlePosition;
