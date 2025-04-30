import React from "react";
import { TurtleInventoryItem } from "@/types/turtle";
import { Gamepad2 } from "lucide-react";
import MinecraftTexture from "@/components/MinecraftTexture";

interface TurtleInventoryProps {
  inventory: TurtleInventoryItem[];
  selectedSlot: number;
  onSelectSlot: (slot: number) => void;
  className?: string; // Add optional className prop
}

const TurtleInventory = ({ 
  inventory, 
  selectedSlot, 
  onSelectSlot,
  className = "" // Default to empty string
}: TurtleInventoryProps) => {
  
  return (
    <div className={`bg-slate-800 border-slate-700 shadow-xl ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-4 w-4" />
          <span className="font-medium">Inventory</span>
        </div>
        <span className="text-xs text-muted-foreground">Selected: {selectedSlot}</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-4 gap-2">
          {inventory.map((item, index) => {
            const slotNumber = index + 1; // Minecraft slots are 1-indexed
            const isSelected = slotNumber === selectedSlot;
            
            return (
              <div 
                key={index}
                onClick={() => onSelectSlot(slotNumber)}
                className={`
                  w-16 h-16 border ${isSelected ? 'border-blue-500' : 'border-slate-600'} 
                  flex items-center justify-center relative bg-slate-700 cursor-pointer
                  hover:border-slate-500 transition-colors clip-edge
                `}
              >
                {item ? (
                  <div className="relative w-full h-full">
                    <MinecraftTexture
                      resourceLocation={getResourcePath(item.name)}
                      fallback="/placeholder.svg"
                      size="80%"
                      alt={simplifyName(item.name)}
                      className="object-cover"
                      tooltip={
                        <div className="p-1">
                          <p className="font-semibold text-sm">{simplifyName(item.name)}</p>
                          <p className="text-xs mt-1">Count: {item.count}</p>
                          {item.damage !== undefined && (
                            <p className="text-xs">Damage: {item.damage}</p>
                          )}
                        </div>
                      }
                    />
                    <div className="absolute bottom-0 right-1 text-xs font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                      {item.count > 1 ? item.count : ""}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">Empty</span>
                )}
                <div className="absolute top-0 left-0 w-4 h-4 flex items-center justify-center text-xs text-slate-400">
                  {slotNumber}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Helper functions
const simplifyName = (name: string) => {
  return name?.replace("minecraft:", "") || "Empty";
};

const getResourcePath = (name: string) => {
  if (!name) return "";
  
  if (name?.includes("minecraft:")) {
    const pureName = name.replace("minecraft:", "");
    
    // Check if it's a block or an item based on naming patterns
    // This is a simplified heuristic
    if (
      pureName.includes("pickaxe") || 
      pureName.includes("sword") || 
      pureName.includes("shovel") || 
      pureName.includes("axe") || 
      pureName.includes("hoe")
    ) {
      return `textures/item/${pureName}.png`;
    }
    
    return `textures/block/${pureName}.png`;
  }
  
  return "";
};

export default TurtleInventory;
