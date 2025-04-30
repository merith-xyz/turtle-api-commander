
import { TurtleInventoryItem } from "@/types/turtle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TurtleInventoryProps {
  inventory: TurtleInventoryItem[];
  selectedSlot: number;
}

const TurtleInventory = ({ inventory, selectedSlot }: TurtleInventoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {inventory.map((item, index) => (
            <div 
              key={index}
              className={`
                border rounded-md p-2 min-h-20 flex flex-col items-center justify-center text-center
                ${selectedSlot === index ? "border-primary bg-primary/5" : "border-border"}
              `}
            >
              {item.count && item.displayName ? (
                <>
                  <div className="w-8 h-8 bg-slate-200 rounded-sm mb-1 flex items-center justify-center">
                    {item.name?.includes("minecraft:") && (
                      <span className="text-xs font-bold">{item.name.replace("minecraft:", "").charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="text-xs font-medium truncate w-full">
                    {item.displayName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    x{item.count}
                  </div>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Empty</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TurtleInventory;
