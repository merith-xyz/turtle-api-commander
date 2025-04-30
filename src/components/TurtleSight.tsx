
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TurtleSight as TurtleSightType } from "@/types/turtle";
import { ArrowUp, ArrowDown, ArrowRight, Eye } from "lucide-react";
import MinecraftTexture from "@/components/MinecraftTexture";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TurtleSightProps {
  sight: TurtleSightType;
}

const SightBlock = ({ 
  direction, 
  data, 
  icon: Icon 
}: { 
  direction: string; 
  data: Record<string, unknown>; 
  icon: React.ElementType;
}) => {
  const blockName = data.name as string || "unknown";
  const simpleName = blockName?.replace("minecraft:", "") || "empty";
  const hasData = Object.keys(data).length > 0;
  
  const getResourcePath = () => {
    if (!hasData) return "";
    
    // Try to determine if it's an item or a block
    if (blockName?.includes("minecraft:")) {
      const pureName = blockName.replace("minecraft:", "");
      // Default to block textures, but could be enhanced with better detection
      return `textures/block/${pureName}.png`;
    }
    return "";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="border border-gray-500 rounded-md p-2 flex flex-col items-center gap-2 bg-gray-800 cursor-help">
            <div className="flex items-center gap-1 text-xs text-gray-300">
              <Icon className="h-4 w-4" />
              <span>{direction}</span>
            </div>
            <div className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded border border-gray-600">
              {hasData ? (
                <div className="relative w-full h-full">
                  <MinecraftTexture 
                    resourceLocation={getResourcePath()} 
                    fallback="/placeholder.svg"
                    size="100%"
                    alt={`Block ${simpleName}`}
                    className="object-cover"
                  />
                </div>
              ) : (
                <span className="text-xs text-gray-400">Empty</span>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {hasData ? (
            <div className="p-1">
              <p className="font-semibold text-sm">{simpleName}</p>
              <pre className="text-xs mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          ) : (
            <p>No block detected</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const TurtleSight = ({ sight }: TurtleSightProps) => {
  return (
    <Card className="w-20">
      <CardHeader className="p-2">
        <CardTitle className="text-sm flex items-center justify-center">
          <Eye className="h-4 w-4 mr-1" />
          Sight
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 flex flex-col gap-2">
        <SightBlock direction="Up" data={sight.up} icon={ArrowUp} />
        <SightBlock direction="Front" data={sight.front} icon={ArrowRight} />
        <SightBlock direction="Down" data={sight.down} icon={ArrowDown} />
      </CardContent>
    </Card>
  );
};

export default TurtleSight;
