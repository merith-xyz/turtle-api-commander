
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Book } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SingleCommandInput from "@/components/SingleCommandInput";
import LuaScriptEditor from "@/components/LuaScriptEditor";

interface CommandPanelProps {
  turtleId: number;
  onSendCommand: (command: string | string[], isLuaScript?: boolean) => Promise<void>;
  className?: string;
}

const CommandPanel = ({ turtleId, onSendCommand, className = "" }: CommandPanelProps) => {
  const { toast } = useToast();
  
  const handleSendCommand = async (command: string) => {
    try {
      await onSendCommand(command);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };
  
  const handleSendScript = async (script: string) => {
    try {
      await onSendCommand(script, true);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };
  
  return (
    <Card className={`bg-gray-900 border-gray-700 ${className}`}>
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-lg flex items-center text-gray-200">
          <Code className="h-5 w-5 mr-2" />
          Command Terminal
        </CardTitle>
        <a 
          href="https://tweaked.cc" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center text-xs text-blue-400 hover:text-blue-300"
        >
          <Book className="h-4 w-4 mr-1" />
          Documentation
        </a>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="command" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="command">Single Command</TabsTrigger>
            <TabsTrigger value="script">Lua Script</TabsTrigger>
          </TabsList>
          
          <TabsContent value="command" className="space-y-4">
            <SingleCommandInput onSendCommand={handleSendCommand} />
          </TabsContent>
          
          <TabsContent value="script">
            <LuaScriptEditor onSendScript={handleSendScript} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CommandPanel;
