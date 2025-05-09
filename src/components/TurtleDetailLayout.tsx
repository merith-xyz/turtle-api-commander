
import React from "react";
import { Turtle } from "@/types/turtle";
import TurtleInventory from "@/components/TurtleInventory";
import TurtleLocationCard from "@/components/TurtleLocationCard";
import TurtleFuel from "@/components/TurtleFuel";
import CommandPanel from "@/components/CommandPanel";
import TurtleStatus from "@/components/TurtleStatus";
import { useIsMobile } from "@/hooks/use-mobile";
import TurtleInfoPanel from "@/components/TurtleInfoPanel";

interface TurtleDetailLayoutProps {
  turtle: Turtle;
  onSendCommand: (command: string) => Promise<void>;
  onSelectSlot: (slot: number) => void;
}

const TurtleDetailLayout = ({
  turtle,
  onSendCommand,
  onSelectSlot
}: TurtleDetailLayoutProps) => {
  const isMobile = useIsMobile();
  
  // Mobile layout is a stack
  if (isMobile) {
    return (
      <div className="flex flex-col gap-4">
        {/* Map/Sight */}
        <TurtleLocationCard position={turtle.pos} sight={turtle.sight} />
        
        {/* Status - Added at top for mobile */}
        <TurtleStatus turtle={turtle} />
        
        {/* Command Terminal */}
        <CommandPanel 
          turtleId={turtle.id} 
          onSendCommand={onSendCommand} 
        />
        
        {/* Fuel display */}
        {turtle.fuel && (
          <TurtleFuel 
            fuel={turtle.fuel}
            isCollapsible={true}
            defaultOpen={false}
          />
        )}
        
        {/* Inventory */}
        <TurtleInventory 
          inventory={turtle.inventory} 
          selectedSlot={turtle.selectedSlot}
          onSelectSlot={onSelectSlot}
        />
        
        {/* Info Panel with command results and custom data */}
        <TurtleInfoPanel 
          turtle={turtle}
          onSendCommand={onSendCommand}
        />
      </div>
    );
  }
  
  // Desktop layout with adjusted column ratio (40/60)
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Left column - 5/12 (previously 6/12) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          {/* Map/Sight */}
          <TurtleLocationCard position={turtle.pos} sight={turtle.sight} />

          {/* Status - Integrated at the top of left column */}
          <TurtleStatus turtle={turtle} />
          
          {/* Fuel display */}
          {turtle.fuel && (
            <TurtleFuel 
              fuel={turtle.fuel}
              isCollapsible={false}
            />
          )}
          
          {/* Info Panel with command results and custom data */}
          <TurtleInfoPanel 
            turtle={turtle}
            onSendCommand={onSendCommand}
          />
        </div>
        
        {/* Right column - 7/12 (previously 6/12) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          {/* Command Terminal */}
          <CommandPanel 
            turtleId={turtle.id} 
            onSendCommand={onSendCommand} 
          />
          
          {/* Inventory */}
          <TurtleInventory 
            inventory={turtle.inventory} 
            selectedSlot={turtle.selectedSlot}
            onSelectSlot={onSelectSlot}
          />
        </div>
      </div>
    </div>
  );
};

export default TurtleDetailLayout;
