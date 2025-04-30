
import React from "react";
import { Turtle } from "@/types/turtle";
import { useIsMobile } from "@/hooks/use-mobile";
import TurtleInfoPanel from "@/components/TurtleInfoPanel";
import CommandPanel from "@/components/CommandPanel";
import TurtleInventory from "@/components/TurtleInventory";

interface TurtleDetailLayoutProps {
  turtle: Turtle;
  onSendCommand: (command: string | string[], isLuaScript?: boolean) => Promise<void>;
  onSelectSlot: (slot: number) => void;
}

const TurtleDetailLayout = ({ 
  turtle, 
  onSendCommand, 
  onSelectSlot 
}: TurtleDetailLayoutProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      // Mobile layout - Single column
      <div className="flex flex-col gap-4">
        {/* Info Panel with integrated Sight */}
        <div className="flex-1">
          <TurtleInfoPanel 
            turtle={turtle} 
            onSendCommand={onSendCommand} 
          />
        </div>
        
        {/* Command Panel */}
        <CommandPanel 
          turtleId={turtle.id} 
          onSendCommand={onSendCommand} 
          className="clip-edge"
        />
        
        {/* Inventory */}
        {turtle.inventory && (
          <TurtleInventory 
            inventory={turtle.inventory} 
            selectedSlot={turtle.selectedSlot} 
            onSelectSlot={onSelectSlot}
            className="clip-edge"
          />
        )}
      </div>
    );
  }

  return (
    // Desktop layout - Now with 2 columns since sight is moved inside info panel
    <div className="grid grid-cols-6 gap-4">
      {/* Left Column - Info Panel (now with Sight inside) */}
      <div className="col-span-2">
        <TurtleInfoPanel 
          turtle={turtle} 
          onSendCommand={onSendCommand} 
        />
      </div>
      
      {/* Right Column - Command Panel & Inventory */}
      <div className="col-span-4 flex flex-col gap-4">
        <CommandPanel 
          turtleId={turtle.id} 
          onSendCommand={onSendCommand}
          className="w-full clip-edge" 
        />
        
        {turtle.inventory && (
          <TurtleInventory 
            inventory={turtle.inventory} 
            selectedSlot={turtle.selectedSlot} 
            onSelectSlot={onSelectSlot}
            className="w-full clip-edge"
          />
        )}
      </div>
    </div>
  );
};

export default TurtleDetailLayout;
