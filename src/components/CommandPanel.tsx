
import { useState } from "react";
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
import { ArrowRight, Send, FileCode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface CommandPanelProps {
  turtleId: number;
  onSendCommand: (command: string | string[], isLuaScript?: boolean) => Promise<void>;
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

const CommandPanel = ({ turtleId, onSendCommand }: CommandPanelProps) => {
  const [command, setCommand] = useState("");
  const [luaScript, setLuaScript] = useState("");
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
      // Don't clear the command field to allow for repeated commands
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
    
    setIsLoading(true);
    try {
      await onSendCommand(luaScript, true);
      toast({
        title: "Lua script sent",
        description: `Sent Lua script to Turtle #${turtleId}`,
      });
      // Don't clear the script to allow for edits and resending
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
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-medium">Command Panel</h2>
      
      <Tabs defaultValue="command">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="command">Single Command</TabsTrigger>
          <TabsTrigger value="script">Lua Script</TabsTrigger>
        </TabsList>
        
        <TabsContent value="command" className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Quick Commands</label>
            <Select onValueChange={handleQuickCommand}>
              <SelectTrigger>
                <SelectValue placeholder="Select command..." />
              </SelectTrigger>
              <SelectContent>
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendCommand();
                }
              }}
            />
            <Button onClick={handleSendCommand} disabled={isLoading || !command.trim()}>
              {isLoading ? (
                <ArrowRight className="h-4 w-4 animate-pulse" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="script" className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              Lua Script
            </label>
            <Textarea
              value={luaScript}
              onChange={(e) => setLuaScript(e.target.value)}
              placeholder="-- Enter Lua script here"
              className="font-mono h-32 resize-y"
            />
          </div>
          
          <Button 
            onClick={handleSendLuaScript} 
            disabled={isLoading || !luaScript.trim()}
            className="w-full"
          >
            {isLoading ? (
              <ArrowRight className="h-4 w-4 animate-pulse mr-2" />
            ) : (
              <FileCode className="h-4 w-4 mr-2" />
            )}
            Send Script
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default CommandPanel;
