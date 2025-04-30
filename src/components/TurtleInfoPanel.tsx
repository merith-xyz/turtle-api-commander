
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Turtle, isTurtleOffline } from "@/types/turtle";
import { Badge } from "@/components/ui/badge";
import { Terminal, Clock, Battery, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface TurtleInfoPanelProps {
  turtle: Turtle;
}

const TurtleInfoPanel = ({ turtle }: TurtleInfoPanelProps) => {
  const isOffline = isTurtleOffline(turtle);
  const [cmdSuccess, cmdResult] = turtle.cmdResult || [false, null];
  const heartbeatDate = new Date(turtle.heartbeat * 1000);
  const lastSeen = formatDistanceToNow(heartbeatDate, { addSuffix: true });
  
  // Calculate fuel percentage
  const fuelPercentage = turtle.fuel ? (turtle.fuel.current / turtle.fuel.max) * 100 : 0;
  
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
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            <span>Turtle Info</span>
          </div>
          <Badge 
            variant={isOffline ? "destructive" : "outline"} 
            className={isOffline ? "bg-red-500" : ""}
          >
            {isOffline ? "Offline" : "Online"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fuel Status Section */}
        <div className="space-y-2 border-b pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Fuel Status</span>
            </div>
            <span className={`text-xs font-medium ${statusColor}`}>
              {fuelStatus}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span>
              {turtle.fuel ? `${turtle.fuel.current} / ${turtle.fuel.max}` : "N/A"}
            </span>
            <span className="text-muted-foreground">
              {fuelPercentage.toFixed(1)}% remaining
            </span>
          </div>
          <Progress value={fuelPercentage} className="h-2" />
        </div>

        {/* Last Seen Section */}
        <div className="space-y-1 border-b pb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Last seen</span>
          </div>
          <p className="text-sm">{lastSeen}</p>
        </div>

        {/* Command Result Section */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Last command result</span>
          </div>
          <div className="bg-muted p-2 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={cmdSuccess ? "outline" : "destructive"} className={cmdSuccess ? "border-green-500 text-green-500" : ""}>
                {cmdSuccess ? "Success" : "Failed"}
              </Badge>
            </div>
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
              {cmdResult !== null && cmdResult !== undefined
                ? typeof cmdResult === "object"
                  ? JSON.stringify(cmdResult, null, 2)
                  : String(cmdResult)
                : "No result"}
            </pre>
          </div>
        </div>

        {/* Command Queue Section */}
        {turtle.cmdQueue.length > 0 && (
          <div className="space-y-1 border-t pt-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Command queue</span>
            </div>
            <div className="bg-muted p-2 rounded-md max-h-32 overflow-y-auto">
              <ul className="text-xs space-y-1">
                {turtle.cmdQueue.map((cmd, idx) => (
                  <li key={idx} className="font-mono">
                    {idx + 1}. {cmd}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Misc Data Section */}
        {Object.keys(turtle.misc).length > 0 && (
          <div className="space-y-1 border-t pt-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Custom data</span>
            </div>
            <div className="bg-muted p-2 rounded-md max-h-48 overflow-y-auto">
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(turtle.misc, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TurtleInfoPanel;
