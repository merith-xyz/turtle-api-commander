
import { useState } from "react";
import { TurtleInventoryItem } from "@/types/turtle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MinecraftTexture from "@/components/MinecraftTexture"; 
import { Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TurtleInventoryProps {
  inventory: TurtleInventoryItem[];
  selectedSlot: number;
  onSelectSlot?: (slot: number) => void;
}

const TurtleInventory = ({ 
  inventory, 
  selectedSlot, 
  onSelectSlot 
}: TurtleInventoryProps) => {
  const { toast } = useToast();
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  
  const handleSlotClick = (index: number) => {
    const now = Date.now();
    
    // Handle double click (within 300ms)
    if (now - lastClickTime < 300 && selectedSlot === index) {
      if (onSelectSlot) {
        onSelectSlot(index + 1); // +1 because Minecraft uses 1-indexed slots
        toast({
          title: "Selecting slot",
          description: `Sending command to select slot ${index + 1}`
        });
      }
    }
    
    setLastClickTime(now);
  };
  
  // Get texture path for an item
  const getItemTexture = (item: TurtleInventoryItem): string => {
    if (!item.name) return "";
    
    // Remove minecraft: prefix
    const itemName = item.name.replace("minecraft:", "");
    
    // Determine if it's a block or item (simple heuristic)
    const isBlock = itemName.includes("_block") || 
                   ["stone", "dirt", "grass", "log", "planks"].some(b => itemName.includes(b));
                   
    return isBlock 
      ? `textures/block/${itemName}.png`
      : `textures/item/${itemName}.png`;
  };
  
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-lg flex items-center text-gray-200">
          <Square className="h-5 w-5 mr-2" />
          Inventory
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-1">
          {inventory.map((item, index) => (
            <div 
              key={index}
              className={`
                border rounded-sm p-1 w-16 h-16 flex flex-col items-center justify-center text-center
                ${selectedSlot === index ? "border-yellow-500 bg-yellow-900/20" : "border-gray-600 bg-gray-700"}
                transition-all duration-100 hover:border-gray-500 cursor-pointer
              `}
              onClick={() => handleSlotClick(index)}
            >
              {item.count && item.name ? (
                <>
                  <div className="w-10 h-10 flex items-center justify-center">
                    <MinecraftTexture 
                      resourceLocation={getItemTexture(item)}
                      size="32px"
                      alt={item.displayName || item.name}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-xs font-medium text-gray-300 truncate w-full mt-1">
                    {item.count}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs text-gray-500">Empty</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TurtleInventory;
