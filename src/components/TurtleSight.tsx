
import React from "react";
import { TurtleSight as TurtleSightType } from "@/types/turtle";
import { ArrowUp, ArrowDown, ArrowRight, Eye } from "lucide-react";
import MinecraftTexture from "@/components/MinecraftTexture";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface TurtleSightProps {
  sight: TurtleSightType;
  className?: string;
  isCollapsible?: boolean;
  defaultOpen?: boolean;
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

  const tooltipContent = hasData ? (
    <div className="p-1">
      <p className="font-semibold text-sm">{simpleName}</p>
      <pre className="text-xs mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  ) : (
    <p>No block detected</p>
  );

  return (
    <div className="border border-slate-500 rounded-sm p-2 flex flex-col items-center gap-2 bg-slate-800 shadow-lg relative clip-edge">
      <div className="flex items-center gap-1 text-xs text-slate-300">
        <Icon className="h-4 w-4" />
        <span>{direction}</span>
      </div>
      <div className="w-12 h-12 flex items-center justify-center bg-slate-700 rounded-none border border-slate-600 clip-edge">
        {hasData ? (
          <div className="relative w-full h-full">
            <MinecraftTexture 
              resourceLocation={getResourcePath()} 
              fallback="/placeholder.svg"
              size="100%"
              alt={`Block ${simpleName}`}
              className="object-cover"
              tooltip={tooltipContent}
            />
          </div>
        ) : (
          <span className="text-xs text-slate-400">Empty</span>
        )}
      </div>
    </div>
  );
};

const TurtleSight = ({ sight, className = "", isCollapsible = false, defaultOpen = true }: TurtleSightProps) => {
  const sightContent = (
    <div className="flex flex-row justify-around gap-2">
      <SightBlock direction="Up" data={sight.up} icon={ArrowUp} />
      <SightBlock direction="Front" data={sight.front} icon={ArrowRight} />
      <SightBlock direction="Down" data={sight.down} icon={ArrowDown} />
    </div>
  );

  if (isCollapsible) {
    return (
      <Collapsible defaultOpen={defaultOpen} className={`bg-slate-800 border-slate-700 shadow-xl clip-edge ${className}`}>
        <div className="flex items-center justify-between p-2 border-b border-slate-700">
          <div className="flex items-center text-sm font-medium">
            <Eye className="h-4 w-4 mr-1" />
            Sight
          </div>
          <CollapsibleTrigger className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <ChevronDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="p-2">
          {sightContent}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className={`bg-slate-800 border-slate-700 shadow-xl clip-edge ${className}`}>
      <div className="p-2 border-b border-slate-700">
        <div className="text-sm flex items-center justify-center">
          <Eye className="h-4 w-4 mr-1" />
          Sight
        </div>
      </div>
      <div className="p-2">
        {sightContent}
      </div>
    </div>
  );
};

export default TurtleSight;
