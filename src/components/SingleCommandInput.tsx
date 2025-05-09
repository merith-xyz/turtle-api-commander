
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SingleCommandInputProps {
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

const SingleCommandInput = ({ onSendCommand }: SingleCommandInputProps) => {
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
        description: `Sent "${command}"`,
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
  
  const handleQuickCommand = (cmd: string) => {
    setCommand(cmd);
  };
  
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default SingleCommandInput;
