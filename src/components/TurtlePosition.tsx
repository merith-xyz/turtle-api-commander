
import { type TurtlePosition as TurtlePositionType } from "@/types/turtle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";

interface TurtlePositionProps {
  position: TurtlePositionType;
}

const TurtlePosition = ({ position }: TurtlePositionProps) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Position</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
};

export default TurtlePosition;
