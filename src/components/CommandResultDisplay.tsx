
import React from "react";
import { Badge } from "@/components/ui/badge";

interface CommandResultDisplayProps {
  success: boolean | null | undefined;
  result: any;
}

const CommandResultDisplay = ({ success, result }: CommandResultDisplayProps) => {
  // Handle undefined/null success values
  const isSuccess = success === true;
  
  return (
    <div className="bg-muted p-2 rounded-md clip-edge-sm">
      <div className="flex items-center gap-2 mb-1">
        <Badge 
          variant={isSuccess ? "outline" : "destructive"} 
          className={`${isSuccess ? "border-green-500 text-green-500" : ""} clip-edge-sm`}
        >
          {isSuccess ? "Success" : "Failed"}
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
