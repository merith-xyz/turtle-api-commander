
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

interface DebugPanelProps {
  data: any;
  title?: string;
}

const DebugPanel = ({ data, title = "Debug Data" }: DebugPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="my-4 overflow-hidden">
      <div className="p-4 bg-muted/50">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-sm">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpand}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isExpanded ? "Hide" : "Show"} Debug Data
            </span>
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 max-h-96 overflow-auto bg-black">
          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  );
};

export default DebugPanel;
