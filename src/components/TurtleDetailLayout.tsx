
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
        {/* Status */}
        <TurtleStatus turtle={turtle} />
        
        {/* Map/Sight */}
        <TurtleLocationCard position={turtle.pos} sight={turtle.sight} />
        
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
        
        {/* Fuel */}
        <TurtleFuel 
          fuel={turtle.fuel}
          isCollapsible={true}
          defaultOpen={false} 
        />
        
        {/* Info Panel with command results and custom data */}
        <TurtleInfoPanel 
          turtle={turtle}
          onSendCommand={onSendCommand}
        />
      </div>
    );
  }
  
  // Desktop layout with two columns
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Left column - 6/12 */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
          {/* Status - Integrated at the top of left column */}
          <TurtleStatus turtle={turtle} />
          
          {/* Map/Sight */}
          <TurtleLocationCard position={turtle.pos} sight={turtle.sight} />
          
          {/* Fuel */}
          <TurtleFuel fuel={turtle.fuel} />
          
          {/* Info Panel with command results and custom data */}
          <TurtleInfoPanel 
            turtle={turtle}
            onSendCommand={onSendCommand}
          />
        </div>
        
        {/* Right column - 6/12 */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
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
