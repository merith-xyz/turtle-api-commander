
import React from "react";
import { Badge } from "@/components/ui/badge";

interface CommandResultDisplayProps {
  success: boolean;
  result: any;
}

const CommandResultDisplay = ({ success, result }: CommandResultDisplayProps) => {
  return (
    <div className="bg-muted p-2 rounded-md clip-edge-sm">
      <div className="flex items-center gap-2 mb-1">
        <Badge 
          variant={success ? "outline" : "destructive"} 
          className={`${success ? "border-green-500 text-green-500" : ""} clip-edge-sm`}
        >
          {success ? "Success" : "Failed"}
        </Badge>
      </div>
      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
        {result !== null && result !== undefined
          ? typeof result === "object"
            ? JSON.stringify(result, null, 2)
            : String(result)
          : "No result"}
      </pre>
    </div>
  );
};

export default CommandResultDisplay;
