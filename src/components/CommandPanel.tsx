
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Send, FileCode, Book, Code } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface CommandPanelProps {
  turtleId: number;
  onSendCommand: (command: string | string[], isLuaScript?: boolean) => Promise<void>;
  className?: string;
}

const COMMON_COMMANDS = [
  "forward",
  "back",
  "up",
  "down",
  "turnLeft",
  "turnRight",
  "dig",
  "digUp",
  "digDown",
  "place",
  "placeUp",
  "placeDown",
  "detect",
  "detectUp",
  "detectDown",
  "getFuelLevel",
  "refuel",
  "select",
  "getItemDetail",
  "inspect",
  "inspectUp",
  "inspectDown",
];

const DEFAULT_SCRIPT = `-- Enter Lua script here
-- Example:
local success, result = turtle.inspect()
if success then
  print(textutils.serialize(result))
else
  print('No block in front')
end

-- Always include a return statement
return "Script completed"`;

const CommandPanel = ({ turtleId, onSendCommand, className = "" }: CommandPanelProps) => {
  const [command, setCommand] = useState("");
  const [luaScript, setLuaScript] = useState(DEFAULT_SCRIPT);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSendCommand = async () => {
    if (!command.trim()) return;
    
    setIsLoading(true);
    try {
      await onSendCommand(command);
      toast({
        title: "Command sent",
        description: `Sent "${command}" to Turtle #${turtleId}`,
      });
    } catch (error) {
      toast({
        title: "Failed to send command",
        description: "There was an error sending the command.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendLuaScript = async () => {
    if (!luaScript.trim()) return;
    
    // Check if script contains a return statement
    if (!luaScript.includes("return")) {
      // Add return statement if missing
      const scriptWithReturn = luaScript + "\n\nreturn \"Script completed without explicit return value\"";
      setLuaScript(scriptWithReturn);
      
      toast({
        title: "Return statement added",
        description: "A return statement was automatically added to your script.",
      });
      
      setIsLoading(true);
      try {
        await onSendCommand(scriptWithReturn, true);
      } catch (error) {
        toast({
          title: "Failed to send script",
          description: "There was an error sending the Lua script.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    setIsLoading(true);
    try {
      await onSendCommand(luaScript, true);
      toast({
        title: "Lua script sent",
        description: `Sent Lua script to Turtle #${turtleId}`,
      });
    } catch (error) {
      toast({
        title: "Failed to send script",
        description: "There was an error sending the Lua script.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQuickCommand = (cmd: string) => {
    setCommand(cmd);
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
        <Tabs defaultValue="script" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="command">Single Command</TabsTrigger>
            <TabsTrigger value="script">Lua Script</TabsTrigger>
          </TabsList>
          
          <TabsContent value="command" className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Quick Commands</label>
              <Select onValueChange={handleQuickCommand}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-200">
                  <SelectValue placeholder="Select command..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-gray-200">
                  {COMMON_COMMANDS.map((cmd) => (
                    <SelectItem key={cmd} value={cmd}>
                      {cmd}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Enter command..."
                className="bg-gray-800 border-gray-600 text-gray-200"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendCommand();
                  }
                }}
              />
              <Button 
                onClick={handleSendCommand} 
                disabled={isLoading || !command.trim()}
                className="bg-blue-600 hover:bg-blue-500"
              >
                {isLoading ? (
                  <ArrowRight className="h-4 w-4 animate-pulse" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="script">
            <div className="space-y-4">
              <Textarea
                value={luaScript}
                onChange={(e) => setLuaScript(e.target.value)}
                placeholder={DEFAULT_SCRIPT}
                className="font-mono h-[300px] resize-none bg-gray-800 border-gray-600 text-gray-200 syntax-highlight"
                style={{
                  lineHeight: '1.5',
                  fontFamily: 'Consolas, Monaco, "Andale Mono", monospace'
                }}
              />
              
              <div className="text-xs text-gray-400 italic">
                Your script must include a return statement to show results.
              </div>
              
              <Button 
                onClick={handleSendLuaScript} 
                disabled={isLoading || !luaScript.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500"
              >
                {isLoading ? (
                  <ArrowRight className="h-4 w-4 animate-pulse mr-2" />
                ) : (
                  <FileCode className="h-4 w-4 mr-2" />
                )}
                Run Script
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CommandPanel;
