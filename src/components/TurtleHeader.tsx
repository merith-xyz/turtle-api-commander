
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Turtle, isTurtleOffline } from "@/types/turtle";
import SettingsButton from "@/components/SettingsButton";

interface TurtleHeaderProps {
  turtle: Turtle | null;
  onToggleDebug: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  isBackgroundLoading: boolean;
  debugMode: boolean;
}

const TurtleHeader = ({ 
  turtle, 
  onToggleDebug, 
  onRefresh, 
  isLoading, 
  isBackgroundLoading,
  debugMode
}: TurtleHeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Link to="/" className="flex items-center gap-2 text-blue-400 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onToggleDebug}
            className={`clip-edge-btn ${debugMode ? "bg-yellow-900 text-yellow-100" : "bg-gray-800 text-gray-200"}`}
          >
            {debugMode ? "Hide Debug" : "Show Debug"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="bg-gray-800 text-gray-200 clip-edge-btn"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isBackgroundLoading ? "animate-spin" : ""}`} />
          </Button>
          <SettingsButton />
        </div>
      </div>

      {turtle && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{turtle.name} <span className="text-gray-400">#{turtle.id}</span></h1>
            {isTurtleOffline(turtle) && (
              <Badge variant="destructive" className="clip-edge-sm">Offline</Badge>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TurtleHeader;
