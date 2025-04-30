
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Turtle, isTurtleOffline } from "@/types/turtle";
import { Badge } from "@/components/ui/badge";
import { Terminal, Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TurtleStatusProps {
  turtle: Turtle;
}

const TurtleStatus = ({ turtle }: TurtleStatusProps) => {
  const isOffline = isTurtleOffline(turtle);
  const [cmdSuccess, cmdResult] = turtle.cmdResult || [false, null];
  const heartbeatDate = new Date(turtle.heartbeat * 1000);
  const lastSeen = formatDistanceToNow(heartbeatDate, { addSuffix: true });
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            <span>Status</span>
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
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Last seen</span>
          </div>
          <p className="text-sm font-medium">{lastSeen}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Last command result</span>
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

        {turtle.cmdQueue.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Command queue</span>
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

        {Object.keys(turtle.misc).length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Misc data</span>
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

export default TurtleStatus;
