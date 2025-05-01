
import React from "react";
import { Turtle } from "@/types/turtle";
import TurtleInventory from "@/components/TurtleInventory";
import TurtlePosition from "@/components/TurtlePosition";
import TurtleFuel from "@/components/TurtleFuel";
import TurtleSight from "@/components/TurtleSight";
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
        <TurtleStatus turtle={turtle} />
        <CommandPanel 
          onSendCommand={onSendCommand}
          selectedSlot={turtle.selectedSlot}
        />
        <div className="grid grid-cols-1 gap-4">
          <TurtleInventory 
            inventory={turtle.inventory} 
            selectedSlot={turtle.selectedSlot}
            onSelectSlot={onSelectSlot}
          />
          <TurtleFuel 
            fuel={turtle.fuel} 
            isCollapsible={true}
            defaultOpen={false} 
          />
          <TurtlePosition 
            position={turtle.pos} 
            isCollapsible={true}
            defaultOpen={false} 
          />
          <TurtleSight 
            sight={turtle.sight} 
            position={turtle.pos}
            isCollapsible={true}
            defaultOpen={false} 
          />
          <TurtleInfoPanel 
            turtle={turtle}
            isCollapsible={true}
            defaultOpen={false}
          />
        </div>
      </div>
    );
  }
  
  // Desktop layout is a grid
  return (
    <div className="flex flex-col gap-4">
      <TurtleStatus turtle={turtle} />
      <div className="grid grid-cols-12 gap-4">
        {/* Left side - 8/12 */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          <CommandPanel 
            onSendCommand={onSendCommand}
            selectedSlot={turtle.selectedSlot}
          />
          <TurtleInventory 
            inventory={turtle.inventory} 
            selectedSlot={turtle.selectedSlot}
            onSelectSlot={onSelectSlot}
          />
        </div>
        
        {/* Right side - 4/12 */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <TurtleFuel fuel={turtle.fuel} />
          <TurtlePosition position={turtle.pos} />
          <TurtleSight sight={turtle.sight} position={turtle.pos} />
          <TurtleInfoPanel turtle={turtle} />
        </div>
      </div>
    </div>
  );
};

export default TurtleDetailLayout;
