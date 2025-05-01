
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { setApiBaseUrl } from "@/services/turtleApi";
import { useApiSettings } from "@/contexts/ApiSettingsContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTurtleData } from "@/hooks/useTurtleData";
import { useTurtleCommands } from "@/hooks/useTurtleCommands";
import TurtleHeader from "@/components/TurtleHeader";
import TurtleDetailLayout from "@/components/TurtleDetailLayout";
import TurtleNotFound from "@/components/TurtleNotFound";
import TurtleLoading from "@/components/TurtleLoading";
import DebugPanel from "@/components/DebugPanel";
import { MapProvider } from "@/contexts/MapContext";
import WorldMap from "@/components/WorldMap";

const TurtleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const turtleId = parseInt(id || "0");
  const isMobile = useIsMobile();
  const { apiBaseUrl } = useApiSettings();
  
  const [debugMode, setDebugMode] = useState<boolean>(() => {
    return localStorage.getItem('debugMode') === 'true';
  });

  useEffect(() => {
    // Dynamically update the API base URL in turtleApi
    setApiBaseUrl(apiBaseUrl);
  }, [apiBaseUrl]);

  // Use our custom hooks
  const {
    turtle,
    isLoading,
    isBackgroundLoading,
    lastApiResponse,
    lastCommandResponse,
    setLastCommandResponse,
    fetchTurtleData,
    userInteracting
  } = useTurtleData({ turtleId, apiBaseUrl });

  const { sendCommand } = useTurtleCommands({
    turtleId,
    apiBaseUrl,
    setLastCommandResponse,
    fetchTurtleData,
    userInteracting
  });

  // Function to toggle debug mode
  const toggleDebugMode = () => {
    const newMode = !debugMode;
    setDebugMode(newMode);
    localStorage.setItem('debugMode', newMode.toString());
  };

  // Function to manually refresh data
  const handleManualRefresh = () => {
    fetchTurtleData(true);
  };

  // Handle selecting a turtle inventory slot
  const handleSelectSlot = (slot: number) => {
    // Minecraft slots are 1-indexed
    sendCommand(`turtle.select(${slot})`);
  };

  return (
    <MapProvider>
      <div className="min-h-screen bg-gray-900 text-gray-100 turtle-bg-pattern">
        <div className="container mx-auto p-4">
          <TurtleHeader 
            turtle={turtle}
            onToggleDebug={toggleDebugMode}
            onRefresh={handleManualRefresh}
            isLoading={isLoading}
            isBackgroundLoading={isBackgroundLoading}
            debugMode={debugMode}
          />

          {debugMode && (
            <DebugPanel 
              apiResponse={lastApiResponse}
              commandResponse={lastCommandResponse}
              title="Debug Information"
            />
          )}

          {isLoading ? (
            <TurtleLoading />
          ) : turtle ? (
            <>
              <TurtleDetailLayout 
                turtle={turtle} 
                onSendCommand={sendCommand}
                onSelectSlot={handleSelectSlot}
              />
              <div className="mt-4">
                <WorldMap 
                  turtlePosition={turtle.pos}
                  isCollapsible={true}
                  defaultOpen={true}
                />
              </div>
            </>
          ) : (
            <TurtleNotFound turtleId={turtleId} />
          )}
        </div>
      </div>
    </MapProvider>
  );
};

export default TurtleDetail;
