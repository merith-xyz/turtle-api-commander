
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Turtle, isTurtleOffline } from "@/types/turtle";
import { Badge } from "@/components/ui/badge";
import { Terminal, Clock, Info, Plus } from "lucide-react";
import { formatRelative } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CommandResultDisplay from "@/components/CommandResultDisplay";
import CommandQueueDisplay from "@/components/CommandQueueDisplay";
import CustomDataPanel from "@/components/CustomDataPanel";

interface TurtleInfoPanelProps {
  turtle: Turtle;
  onSendCommand: (command: string | string[], isLuaScript?: boolean) => Promise<void>;
  isCollapsible?: boolean;
  defaultOpen?: boolean;
}

const TurtleInfoPanel = ({ 
  turtle, 
  onSendCommand, 
  isCollapsible = false, 
  defaultOpen = true 
}: TurtleInfoPanelProps) => {
  const isOffline = isTurtleOffline(turtle);
  const [cmdSuccess, cmdResult] = turtle.cmdResult || [false, null];
  const heartbeatDate = new Date(turtle.heartbeat * 1000);
  const lastSeen = formatRelative(heartbeatDate, new Date());
  
  // Handler to add data to ultron.data.misc
  const handleAddMiscData = async (key: string, value: any, type: string) => {
    // Convert value to Lua string representation
    let luaValue: string;
    if (type === "string") {
      luaValue = `"${String(value).replace(/"/g, '\\"')}"`;
    } else if (type === "number") {
      luaValue = String(value);
    } else {
      // For tables, format JSON as Lua table
      const jsonString = JSON.stringify(value);
      luaValue = jsonString
        .replace(/{/g, "{")
        .replace(/}/g, "}")
        .replace(/:/g, "=")
        .replace(/"([^"]+)"=/g, "[$1]=");
    }
    
    // Create Lua command to update ultron.data.misc
    const command = `ultron.data.misc["${key}"] = ${luaValue}; return ultron.data.misc["${key}"]`;
    
    await onSendCommand(command);
  };
  
  return (
    <Card className="h-full clip-edge">
      {/* Header with Title and Status Badge */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          <span className="font-semibold">Turtle Info</span>
        </div>
        <Badge 
          variant={isOffline ? "destructive" : "outline"} 
          className={`${isOffline ? "bg-red-500" : ""} clip-edge`}
        >
          {isOffline ? "Offline" : "Online"}
        </Badge>
      </div>

      <CardContent className="p-0">
        <Accordion 
          type="multiple" 
          defaultValue={["lastSeen", "cmdResult", "customData"]} 
          className="w-full"
        >
          {/* Last Seen Section */}
          <AccordionItem value="lastSeen" className="border-b border-slate-700">
            <div className="px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Last seen</span>
                </div>
              </AccordionTrigger>
            </div>
            <AccordionContent className="pb-4 px-4">
              <p className="text-sm">{lastSeen}</p>
            </AccordionContent>
          </AccordionItem>

          {/* Command Result Section */}
          <AccordionItem value="cmdResult" className="border-b border-slate-700">
            <div className="px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Last command result</span>
                </div>
              </AccordionTrigger>
            </div>
            <AccordionContent className="pb-4 px-4">
              <CommandResultDisplay success={cmdSuccess} result={cmdResult} />
            </AccordionContent>
          </AccordionItem>

          {/* Command Queue Section */}
          {turtle.cmdQueue.length > 0 && (
            <AccordionItem value="cmdQueue" className="border-b border-slate-700">
              <div className="px-4">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Command queue</span>
                  </div>
                </AccordionTrigger>
              </div>
              <AccordionContent className="pb-4 px-4">
                <CommandQueueDisplay commands={turtle.cmdQueue} />
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Custom Data Section */}
          <AccordionItem value="customData" className="border-b border-slate-700">
            <div className="px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Custom Data</span>
                </div>
              </AccordionTrigger>
            </div>
            <AccordionContent className="pb-4 px-4">
              <CustomDataPanel 
                miscData={turtle.misc} 
                onAddData={handleAddMiscData} 
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default TurtleInfoPanel;
