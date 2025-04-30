
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
import { ArrowRight, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface CommandPanelProps {
  turtleId: number;
  onSendCommand: (command: string) => Promise<void>;
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
      setCommand("");
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
  
  const handleQuickCommand = (cmd: string) => {
    setCommand(cmd);
  };
  
  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-medium">Command Panel</h2>
      
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
    </Card>
  );
};

export default CommandPanel;
