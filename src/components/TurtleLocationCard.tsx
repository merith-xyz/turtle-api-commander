
import React from "react";
import { TurtlePosition as TurtlePositionType, TurtleSight as TurtleSightType } from "@/types/turtle";
import { Card, CardContent } from "@/components/ui/card";
import TurtleSight from "@/components/TurtleSight";
import TurtlePosition from "@/components/TurtlePosition";
import { MapProvider, useMap } from "@/contexts/MapContext";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Compass, Map, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TurtleLocationCardProps {
  position: TurtlePositionType;
  sight: TurtleSightType;
  className?: string;
}

const MapTab = ({ position }: { position: TurtlePositionType }) => {
  const { mapBlocks, clearMap } = useMap();
  const [zoomLevel, setZoomLevel] = React.useState(2);
  
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
      position: { x: position.x, y: position.y, z: position.z },
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
  
  const noBlocks = mapBlocks.length === 0;
  
  return (
    <div className="p-2">
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
          Clear Map
        </Button>
      </div>

      {noBlocks ? (
        <div className="p-4 text-center text-slate-400">
          <p>No map data yet.</p>
          <p className="text-xs mt-2">The map will update as the turtle moves and sees blocks.</p>
        </div>
      ) : (
        <div className="border border-slate-700 rounded bg-slate-900/50">
          <div className="p-4 h-64 flex items-center justify-center">
            {/* This is where we'll implement a 3D map view */}
            <div className="text-center text-slate-400">
              <Navigation className="h-12 w-12 mx-auto mb-2" />
              <p>3D map view will be implemented here</p>
              <p className="text-xs mt-2">Currently showing {mapBlocks.length} blocks</p>
            </div>
          </div>
          <div className="p-2 border-t border-slate-700 bg-slate-800/50 text-xs text-slate-400">
            Turtle at ({position.x}, {position.y}, {position.z}) facing {position.rname}
          </div>
        </div>
      )}
    </div>
  );
};

const TurtleLocationCard = ({ position, sight, className = "" }: TurtleLocationCardProps) => {
  return (
    <Card className={`${className} clip-edge`}>
      {/* Header and Location Info */}
      <div className="p-4 border-b border-slate-700 flex items-center space-x-2">
        <Compass className="h-5 w-5" />
        <h3 className="font-medium">Location & Navigation</h3>
      </div>

      <CardContent className="p-0">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <div className="grid grid-flow-col gap-1 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">X:</span>
                  <span className="font-medium">{position.x}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Y:</span>
                  <span className="font-medium">{position.y}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Z:</span>
                  <span className="font-medium">{position.z}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-xs text-muted-foreground">Facing:</span>
              <span className="ml-1 capitalize font-medium">{position.rname}</span>
              {position.rname === "north" && <ArrowUp className="h-4 w-4 ml-1" />}
              {position.rname === "south" && <ArrowDown className="h-4 w-4 ml-1" />}
              {position.rname === "east" && <ArrowRight className="h-4 w-4 ml-1" />}
              {position.rname === "west" && <ArrowLeft className="h-4 w-4 ml-1" />}
            </div>
          </div>
        </div>

        {/* Tabs for Sight and Map */}
        <Tabs defaultValue="sight" className="w-full">
          <div className="border-b border-slate-700">
            <TabsList className="bg-transparent w-full justify-start p-0">
              <TabsTrigger 
                value="sight" 
                className="data-[state=active]:bg-slate-800 data-[state=active]:border-b-2 data-[state=active]:border-b-blue-500 data-[state=active]:shadow-none rounded-none"
              >
                Sight
              </TabsTrigger>
              <TabsTrigger 
                value="map" 
                className="data-[state=active]:bg-slate-800 data-[state=active]:border-b-2 data-[state=active]:border-b-blue-500 data-[state=active]:shadow-none rounded-none"
              >
                3D Map
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="sight">
            <TurtleSight 
              sight={sight} 
              position={position}
              className="border-0 shadow-none bg-transparent" 
            />
          </TabsContent>
          
          <TabsContent value="map">
            <MapTab position={position} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TurtleLocationCard;
