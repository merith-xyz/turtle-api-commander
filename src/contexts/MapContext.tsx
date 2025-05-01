
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TurtlePosition, TurtleSight } from "@/types/turtle";

// Define the structure for a map block
export interface MapBlock {
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  data: Record<string, unknown>;
}

// Define the context structure
interface MapContextType {
  mapBlocks: MapBlock[];
  addBlocksFromSight: (sight: TurtleSight, position: TurtlePosition) => void;
  clearMap: () => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const [mapBlocks, setMapBlocks] = useState<MapBlock[]>([]);
  
  // Function to add blocks from turtle's sight
  const addBlocksFromSight = (sight: TurtleSight, position: TurtlePosition) => {
    const newBlocks: MapBlock[] = [];
    
    // Process up block
    if (sight.up && sight.up.name) {
      newBlocks.push({
        name: sight.up.name as string,
        position: {
          x: position.x,
          y: position.y + 1,
          z: position.z
        },
        data: sight.up
      });
    }
    
    // Process front block (adjust position based on rotation)
    if (sight.front && sight.front.name) {
      let frontX = position.x;
      let frontZ = position.z;
      
      // Adjust position based on turtle's rotation
      switch (position.rname) {
        case "north": // -z
          frontZ = position.z - 1;
          break;
        case "south": // +z
          frontZ = position.z + 1;
          break;
        case "west": // -x
          frontX = position.x - 1;
          break;
        case "east": // +x
          frontX = position.x + 1;
          break;
      }
      
      newBlocks.push({
        name: sight.front.name as string,
        position: {
          x: frontX,
          y: position.y,
          z: frontZ
        },
        data: sight.front
      });
    }
    
    // Process down block
    if (sight.down && sight.down.name) {
      newBlocks.push({
        name: sight.down.name as string,
        position: {
          x: position.x,
          y: position.y - 1,
          z: position.z
        },
        data: sight.down
      });
    }
    
    // Update map, replacing any blocks at the same position
    setMapBlocks(prevBlocks => {
      // Filter out blocks that would be replaced by new ones
      const filteredBlocks = prevBlocks.filter(existingBlock => 
        !newBlocks.some(newBlock => 
          newBlock.position.x === existingBlock.position.x &&
          newBlock.position.y === existingBlock.position.y &&
          newBlock.position.z === existingBlock.position.z
        )
      );
      
      // Add new blocks
      return [...filteredBlocks, ...newBlocks];
    });
  };
  
  const clearMap = () => {
    setMapBlocks([]);
  };
  
  return (
    <MapContext.Provider value={{ mapBlocks, addBlocksFromSight, clearMap }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
};
