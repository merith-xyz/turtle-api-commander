import React from "react";
import { TurtleInventoryItem } from "@/types/turtle";
import { Gamepad2, Info } from "lucide-react";
import MinecraftTexture from "@/components/MinecraftTexture";

interface TurtleInventoryProps {
  inventory: TurtleInventoryItem[];
  selectedSlot: number;
  onSelectSlot: (slot: number) => void;
  className?: string;
}

const TurtleInventory = ({ 
  inventory, 
  selectedSlot, 
  onSelectSlot,
  className = ""
}: TurtleInventoryProps) => {
  
  return (
    <div className={`bg-slate-800 border-slate-700 shadow-xl ${className}`}>
      {/* selected slot */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {/* gamepad icon */}
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-4 w-4" />
          <span className="font-medium">Inventory</span>
        </div>
        <span className="text-xs text-muted-foreground">Selected: {selectedSlot}</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-4 gap-1">
          {inventory.map((item, index) => {
            const slotNumber = index + 1; // Minecraft slots are 1-indexed
            const isSelected = slotNumber === selectedSlot;
            
            return (
              <div 
                key={index}
                onClick={() => onSelectSlot(slotNumber)}
                className={`
                  border ${isSelected ? 'border-blue-600' : 'border-slate-600'}
                `}
              >
                {item ? (
                  <div className="relative flex items-center justify-center w-full h-full p-1">
                    <MinecraftTexture
                      resourceLocation={getResourcePath(item.name)}
                      fallback="/placeholder.svg"
                      size={64} 
                      alt={simplifyName(item.name)}
                      isItem={isItemByName(item.name)}
                      hoverCard={
                        <div>
                          <div className="bg-slate-700 p-3 border-b border-slate-600 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4" />
                              <span className="font-semibold">{simplifyName(item.name)}</span>
                            </div>
                            <span className="text-xs bg-slate-600 px-2 py-1 rounded-sm">
                              {item.count} / {item.maxCount || '64'}
                            </span>
                          </div>
                          <div className="p-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="font-medium">Name:</div>
                              <div className="text-slate-300 break-all">{item.name}</div>
                              
                              {item.displayName && (
                                <>
                                  <div className="font-medium">Display:</div>
                                  <div className="text-slate-300 break-all">{item.displayName}</div>
                                </>
                              )}
                              
                              {item.maxCount && (
                                <>
                                  <div className="font-medium">Stack Size:</div>
                                  <div className="text-slate-300">{item.maxCount}</div>
                                </>
                              )}
                            </div>
                            
                            {item.itemGroups && item.itemGroups.length > 0 && (
                              <div className="mt-3">
                                <div className="font-medium mb-1">Item Groups:</div>
                                <div className="flex flex-wrap gap-1">
                                  {item.itemGroups.map((group, idx) => (
                                    <span 
                                      key={idx} 
                                      className="bg-slate-600 px-2 py-0.5 text-xs rounded-sm"
                                    >
                                      {group.displayName || group.id}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {item.tags && Object.keys(item.tags).length > 0 && (
                              <div className="mt-3">
                                <div className="font-medium mb-1">Tags:</div>
                                <div className="flex flex-wrap gap-1">
                                  {Object.keys(item.tags).map((tag) => (
                                    <span 
                                      key={tag} 
                                      className="bg-slate-600 px-2 py-0.5 text-xs rounded-sm"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      }
                    />
                    <div className="absolute bottom-1 right-2 text-sm font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                      {item.count > 1 ? item.count : ""}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">Empty</span>
                )}
                <div className="absolute top-1 left-1 w-5 h-5 flex items-center justify-center text-xs text-slate-400">
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

const isItemByName = (name: string): boolean => {
  if (!name) return false;
  
  const pureName = name.replace("minecraft:", "");
  
  // Common items that should use 3D rendering
  return (
    pureName.includes("pickaxe") || 
    pureName.includes("sword") || 
    pureName.includes("shovel") || 
    pureName.includes("axe") || 
    pureName.includes("hoe") ||
    pureName.includes("bucket") ||
    pureName.includes("apple") ||
    pureName.includes("ingot") ||
    pureName.includes("diamond") ||
    pureName.includes("emerald") ||
    pureName.includes("coal") ||
    pureName.includes("stick") ||
    pureName.includes("torch") ||
    pureName.includes("redstone") ||
    pureName.includes("compass") ||
    pureName.includes("map") ||
    pureName.includes("book") ||
    pureName.includes("bow") ||
    pureName.includes("arrow")
  );
};

const getResourcePath = (name: string) => {
  if (!name) return "";
  
  if (name?.includes("minecraft:")) {
    const pureName = name.replace("minecraft:", "");
    
    // Check if it's a block or an item based on naming patterns
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
