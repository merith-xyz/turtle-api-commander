
import React, { useState } from "react";
import { useMap, MapBlock } from "@/contexts/MapContext";
import MinecraftTexture from "@/components/MinecraftTexture";
import { TurtlePosition } from "@/types/turtle";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { ChevronDown, Map, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorldMapProps {
  turtlePosition: TurtlePosition;
  className?: string;
  isCollapsible?: boolean;
  defaultOpen?: boolean;
}

const WorldMap = ({ 
  turtlePosition, 
  className = "", 
  isCollapsible = false, 
  defaultOpen = true 
}: WorldMapProps) => {
  const { mapBlocks, clearMap } = useMap();
  const [zoomLevel, setZoomLevel] = useState(2); // Controls the block size
  
  // Calculate the bounds of our map
  const getBounds = () => {
    if (mapBlocks.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 };
    }
    
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    
    // Include both map blocks and turtle position in bounds calculation
    [...mapBlocks, {
      name: "turtle",
      position: { x: turtlePosition.x, y: turtlePosition.y, z: turtlePosition.z },
      data: {}
    }].forEach(block => {
      minX = Math.min(minX, block.position.x);
      maxX = Math.max(maxX, block.position.x);
      minY = Math.min(minY, block.position.y);
      maxY = Math.max(maxY, block.position.y);
      minZ = Math.min(minZ, block.position.z);
      maxZ = Math.max(maxZ, block.position.z);
    });
    
    return { minX, maxX, minY, maxY, minZ, maxZ };
  };
  
  const bounds = getBounds();
  
  // If no blocks saved yet
  const noBlocks = mapBlocks.length === 0;
  
  // Calculate grid size based on bounds
  const gridWidth = bounds.maxX - bounds.minX + 3; // Add padding
  const gridHeight = bounds.maxZ - bounds.minZ + 3; // Add padding
  
  // Determine the optimal cell size based on available space and zoom
  const cellSize = 16 * zoomLevel;
  
  // Create grid representation - top down view
  const renderTopView = () => {
    // Create a grid based on bounds
    const grid: JSX.Element[][] = [];
    
    for (let z = bounds.minZ - 1; z <= bounds.maxZ + 1; z++) {
      const row: JSX.Element[] = [];
      
      for (let x = bounds.minX - 1; x <= bounds.maxX + 1; x++) {
        // Find the highest block at this x,z coordinate
        let highestBlock: MapBlock | null = null;
        
        for (const block of mapBlocks) {
          if (block.position.x === x && block.position.z === z) {
            if (!highestBlock || block.position.y > highestBlock.position.y) {
              highestBlock = block;
            }
          }
        }
        
        // Determine if this is the turtle's position
        const isTurtle = x === turtlePosition.x && z === turtlePosition.z;
        
        // Style for grid cell
        const cellStyle: React.CSSProperties = {
          width: `${cellSize}px`,
          height: `${cellSize}px`,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        };
        
        // Create cell element
        let cellContent;
        
        if (isTurtle) {
          // Render turtle marker with rotation indicator
          const rotationClasses = {
            north: "rotate-0",
            east: "rotate-90", 
            south: "rotate-180", 
            west: "rotate-270"
          };
          cellContent = (
            <div 
              className={`bg-green-600 rounded-full w-3/4 h-3/4 flex items-center justify-center ${rotationClasses[turtlePosition.rname] || ""}`}
            >
              <div className="bg-green-300 h-1/2 w-2/3 rounded-t-full"></div>
            </div>
          );
        } else if (highestBlock) {
          // Render block
          // Extract minecraft block name without minecraft: prefix
          const blockName = (highestBlock.name as string).replace("minecraft:", "");
          const resourcePath = `textures/block/${blockName}.png`;
          cellContent = (
            <MinecraftTexture 
              resourceLocation={resourcePath}
              size={cellSize * 0.9}
              alt={blockName}
              tooltip={`${blockName} at ${x},${highestBlock.position.y},${z}`}
            />
          );
        }
        
        row.push(
          <div key={`${x},${z}`} style={cellStyle}>
            {cellContent}
          </div>
        );
      }
      
      grid.push(row);
    }
    
    return (
      <div 
        className="flex flex-col gap-0 overflow-auto max-h-[400px] p-4"
        style={{ maxWidth: `${gridWidth * cellSize + 20}px` }}
      >
        {grid.map((row, idx) => (
          <div key={idx} className="flex flex-row gap-0">
            {row}
          </div>
        ))}
      </div>
    );
  };
  
  const mapContent = (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setZoomLevel(zoomLevel > 1 ? zoomLevel - 1 : 1)}
            className="h-8 w-8 p-0"
          >
            -
          </Button>
          <span className="text-xs font-mono">Zoom: {zoomLevel}x</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setZoomLevel(zoomLevel < 5 ? zoomLevel + 1 : 5)}
            className="h-8 w-8 p-0"
          >
            +
          </Button>
        </div>
        
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={clearMap}
          className="h-8"
        >
          <X className="h-4 w-4 mr-1" /> Clear Map
        </Button>
      </div>
      
      {noBlocks ? (
        <div className="p-4 text-center text-slate-400">
          <p>No map data yet.</p>
          <p className="text-xs mt-2">The map will update as the turtle moves and sees blocks.</p>
        </div>
      ) : (
        <div className="border border-slate-700 rounded bg-slate-900/50 overflow-hidden">
          {renderTopView()}
          <div className="p-2 border-t border-slate-700 bg-slate-800/50 text-xs text-slate-400">
            Turtle at ({turtlePosition.x}, {turtlePosition.y}, {turtlePosition.z}) facing {turtlePosition.rname}
          </div>
        </div>
      )}
    </div>
  );
  
  if (isCollapsible) {
    return (
      <Collapsible defaultOpen={defaultOpen} className={`bg-slate-800 border border-slate-700 shadow-xl clip-edge ${className}`}>
        <div className="flex items-center justify-between p-2 border-b border-slate-700">
          <div className="flex items-center text-sm font-medium">
            <Map className="h-4 w-4 mr-1" />
            World Map
          </div>
          <CollapsibleTrigger className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <ChevronDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="p-2">
          {mapContent}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className={`bg-slate-800 border border-slate-700 shadow-xl clip-edge ${className}`}>
      <div className="p-2 border-b border-slate-700">
        <div className="text-sm flex items-center justify-center">
          <Map className="h-4 w-4 mr-1" />
          World Map
        </div>
      </div>
      <div className="p-2">
        {mapContent}
      </div>
    </div>
  );
};

export default WorldMap;
