
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Turtle, isTurtleOffline } from "@/types/turtle";
import { Badge } from "@/components/ui/badge";
import { Terminal, Clock, Battery, Info, Plus } from "lucide-react";
import { formatRelative } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface TurtleInfoPanelProps {
  turtle: Turtle;
  onSendCommand: (command: string | string[], isLuaScript?: boolean) => Promise<void>;
}

type MiscDataType = "string" | "number" | "table";

interface MiscDataFormValues {
  key: string;
  type: MiscDataType;
  value: string;
}

const TurtleInfoPanel = ({ turtle, onSendCommand }: TurtleInfoPanelProps) => {
  const isOffline = isTurtleOffline(turtle);
  const [cmdSuccess, cmdResult] = turtle.cmdResult || [false, null];
  const heartbeatDate = new Date(turtle.heartbeat * 1000);
  const lastSeen = formatRelative(heartbeatDate, new Date());
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Calculate fuel percentage
  const fuelPercentage = turtle.fuel ? (turtle.fuel.current / turtle.fuel.max) * 100 : 0;
  
  let fuelStatus = "Low";
  let statusColor = "text-red-500";
  
  if (fuelPercentage > 70) {
    fuelStatus = "Good";
    statusColor = "text-green-500";
  } else if (fuelPercentage > 30) {
    fuelStatus = "Moderate";
    statusColor = "text-yellow-500";
  }
  
  // Form for adding data to ultron.data.misc
  const form = useForm<MiscDataFormValues>({
    defaultValues: {
      key: "",
      type: "string",
      value: ""
    }
  });

  const handleAddMiscData = (data: MiscDataFormValues) => {
    let valueToSet: string | number | object;
    
    // Convert value based on selected type
    if (data.type === "number") {
      valueToSet = Number(data.value);
      if (isNaN(valueToSet)) {
        toast({
          title: "Invalid number",
          description: "Please enter a valid number",
          variant: "destructive",
        });
        return;
      }
    } else if (data.type === "table") {
      try {
        // Try to parse as JSON if it's a table
        valueToSet = JSON.parse(data.value);
      } catch (e) {
        toast({
          title: "Invalid JSON",
          description: "Please enter valid JSON for table data",
          variant: "destructive",
        });
        return;
      }
    } else {
      valueToSet = data.value;
    }
    
    // Convert value to Lua string representation
    let luaValue: string;
    if (data.type === "string") {
      luaValue = `"${data.value.replace(/"/g, '\\"')}"`;
    } else if (data.type === "number") {
      luaValue = data.value;
    } else {
      // For tables, format JSON as Lua table 
      // This is a very basic conversion - complex objects will need better handling
      const jsonString = JSON.stringify(valueToSet);
      luaValue = jsonString
        .replace(/{/g, "{")
        .replace(/}/g, "}")
        .replace(/:/g, "=")
        .replace(/"([^"]+)"=/g, "[$1]=");
    }
    
    // Create Lua command to update ultron.data.misc
    const command = `ultron.data.misc["${data.key}"] = ${luaValue}; return ultron.data.misc["${data.key}"]`;
    
    onSendCommand(command)
      .then(() => {
        toast({
          title: "Data added",
          description: `Added ${data.key} to ultron.data.misc`,
        });
        form.reset();
      })
      .catch(() => {
        toast({
          title: "Failed to add data",
          description: "There was an error adding the data",
          variant: "destructive",
        });
      });
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            <span>Turtle Info</span>
          </div>
          <Badge 
            variant={isOffline ? "destructive" : "outline"} 
            className={isOffline ? "bg-red-500" : ""}
          >
            {isOffline ? "Offline" : "Online"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fuel Status Section */}
        <div className="space-y-2 border-b pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Fuel Status</span>
            </div>
            <span className={`text-xs font-medium ${statusColor}`}>
              {fuelStatus}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span>
              {turtle.fuel ? `${turtle.fuel.current} / ${turtle.fuel.max}` : "N/A"}
            </span>
            <span className="text-muted-foreground">
              {fuelPercentage.toFixed(1)}% remaining
            </span>
          </div>
          <Progress value={fuelPercentage} className="h-2" />
        </div>

        {/* Last Seen Section */}
        <div className="space-y-1 border-b pb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Last seen</span>
          </div>
          <p className="text-sm">{lastSeen}</p>
        </div>

        {/* Command Result Section */}
        <div className="space-y-1 border-b pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Last command result</span>
          </div>
          <div className="bg-muted p-2 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={cmdSuccess ? "outline" : "destructive"} className={cmdSuccess ? "border-green-500 text-green-500" : ""}>
                {cmdSuccess ? "Success" : "Failed"}
              </Badge>
            </div>
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
              {cmdResult !== null && cmdResult !== undefined
                ? typeof cmdResult === "object"
                  ? JSON.stringify(cmdResult, null, 2)
                  : String(cmdResult)
                : "No result"}
            </pre>
          </div>
        </div>

        {/* Command Queue Section */}
        {turtle.cmdQueue.length > 0 && (
          <div className="space-y-1 border-b pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Command queue</span>
            </div>
            <div className="bg-muted p-2 rounded-md max-h-32 overflow-y-auto">
              <ul className="text-xs space-y-1">
                {turtle.cmdQueue.map((cmd, idx) => (
                  <li key={idx} className="font-mono">
                    {idx + 1}. {cmd}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Add to ultron.data.misc Section */}
        <div className="space-y-2 border-b pt-4 pb-4">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Add Custom Data</span>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddMiscData)} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Key</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. myData" 
                          className="bg-gray-800 border-gray-600 text-gray-200 h-8 text-xs" 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-200 h-8 text-xs">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-600 text-gray-200">
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="table">Table (JSON)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Value</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={
                          form.watch("type") === "string" ? "e.g. Hello World" :
                          form.watch("type") === "number" ? "e.g. 42" :
                          "e.g. {\"key\":\"value\"}"
                        } 
                        className="bg-gray-800 border-gray-600 text-gray-200 h-8 text-xs" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-500"
              >
                Add to ultron.data.misc
              </Button>
            </form>
          </Form>
        </div>

        {/* Misc Data Section */}
        {Object.keys(turtle.misc).length > 0 && (
          <div className="space-y-1 pt-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Custom data</span>
            </div>
            <div className="bg-muted p-2 rounded-md max-h-48 overflow-y-auto">
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(turtle.misc, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TurtleInfoPanel;
