
import React from "react";
import { TurtleSight as TurtleSightType } from "@/types/turtle";
import { ArrowUp, ArrowDown, Target, Eye } from "lucide-react";
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
  const hasData = Object.keys(data).length > 0 && blockName;
  
  const getResourcePath = () => {
    if (!hasData) return "";
    
    if (blockName?.includes("minecraft:")) {
      const pureName = blockName.replace("minecraft:", "");
      // For blocks, use block textures
      return `textures/block/${pureName}.png`;
    }
    return "";
  };

  // Determine if the block is likely an item rather than a block
  const isItem = blockName?.includes("minecraft:") && 
    (blockName.includes("_pickaxe") || 
     blockName.includes("_sword") || 
     blockName.includes("_axe") || 
     blockName.includes("_shovel") || 
     blockName.includes("_hoe") ||
     blockName.includes("bucket") ||
     blockName.includes("diamond") ||
     blockName.includes("emerald") ||
     blockName.includes("coal") ||
     blockName.includes("stick") ||
     blockName.includes("torch") ||
     blockName.includes("redstone") ||
     blockName.includes("shulker"));

  const tooltipContent = hasData ? (
    <div className="p-1">
      <p className="font-semibold text-sm">{blockName?.replace("minecraft:", "")}</p>
      <pre className="text-xs mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  ) : null;

  return (
    <div className="border border-slate-500 rounded-sm p-2 flex flex-col items-center gap-1 bg-slate-800 shadow-lg relative clip-edge">
      <div className="flex items-center gap-1 text-xs text-slate-300">
        <Icon className="h-3 w-3" />
        <span>{direction}</span>
      </div>
      {hasData ? (
        <div className="flex items-center justify-center">
          <MinecraftTexture 
            resourceLocation={getResourcePath()} 
            size={40}
            alt={`Block ${blockName?.replace("minecraft:", "")}`}
            isItem={isItem}
            tooltip={tooltipContent}
          />
        </div>
      ) : (
        <div className="w-10 h-10 flex items-center justify-center rounded-sm">
          {/* Empty state - just show nothing */}
        </div>
      )}
    </div>
  );
};

const TurtleSight = ({ sight, className = "", isCollapsible = false, defaultOpen = true }: TurtleSightProps) => {
  const sightContent = (
    <div className="flex flex-row justify-center gap-2 w-full">
      <SightBlock direction="Up" data={sight.up} icon={ArrowUp} />
      <SightBlock direction="Front" data={sight.front} icon={Target} />
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
