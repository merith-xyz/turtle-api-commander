
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Turtle, isTurtleOffline, TurtleSight as TurtleSightType } from "@/types/turtle";
import { Badge } from "@/components/ui/badge";
import { Terminal, Clock, Battery, Info, Plus, ChevronDown, Eye } from "lucide-react";
import { formatRelative } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import TurtleSight from "@/components/TurtleSight";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
        <Accordion type="multiple" defaultValue={["sight", "fuel", "lastSeen", "cmdResult"]} className="w-full">
          {/* Turtle Sight Section - Now always visible for both mobile and desktop */}
          {turtle.sight && (
            <AccordionItem value="sight" className="border-b border-slate-700">
              <div className="px-4">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Sight</span>
                  </div>
                </AccordionTrigger>
              </div>
              <AccordionContent className="pb-4 px-4">
                <TurtleSight sight={turtle.sight as TurtleSightType} className="bg-transparent border-0 shadow-none" />
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Fuel Status Section */}
          <AccordionItem value="fuel" className="border-b border-slate-700">
            <div className="px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Fuel Status</span>
                </div>
              </AccordionTrigger>
            </div>
            <AccordionContent className="pb-4 px-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">
                    {turtle.fuel ? `${turtle.fuel.current} / ${turtle.fuel.max}` : "N/A"}
                  </span>
                  <span className={`text-xs font-medium ${statusColor}`}>
                    {fuelStatus} ({fuelPercentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={fuelPercentage} className="h-2" />
              </div>
            </AccordionContent>
          </AccordionItem>

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
              <div className="bg-muted p-2 rounded-md clip-edge-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={cmdSuccess ? "outline" : "destructive"} className={`${cmdSuccess ? "border-green-500 text-green-500" : ""} clip-edge-sm`}>
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
                <div className="bg-muted p-2 rounded-md max-h-32 overflow-y-auto clip-edge-sm">
                  <ul className="text-xs space-y-1">
                    {turtle.cmdQueue.map((cmd, idx) => (
                      <li key={idx} className="font-mono">
                        {idx + 1}. {cmd}
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Add to ultron.data.misc Section */}
          <AccordionItem value="addData" className="border-b border-slate-700">
            <div className="px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Add Custom Data</span>
                </div>
              </AccordionTrigger>
            </div>
            <AccordionContent className="pb-4 px-4">
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
                              className="bg-gray-800 border-gray-600 text-gray-200 h-8 text-xs clip-edge-sm" 
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
                              <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-200 h-8 text-xs clip-edge-sm">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-600 text-gray-200 clip-edge">
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
                            className="bg-gray-800 border-gray-600 text-gray-200 h-8 text-xs clip-edge-sm" 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-500 clip-edge-btn"
                  >
                    Add to ultron.data.misc
                  </Button>
                </form>
              </Form>
            </AccordionContent>
          </AccordionItem>

          {/* Misc Data Section */}
          {Object.keys(turtle.misc).length > 0 && (
            <AccordionItem value="miscData" className="border-b border-slate-700">
              <div className="px-4">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Custom data</span>
                  </div>
                </AccordionTrigger>
              </div>
              <AccordionContent className="pb-4 px-4">
                <div className="bg-muted p-2 rounded-md max-h-48 overflow-y-auto clip-edge-sm">
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(turtle.misc, null, 2)}
                  </pre>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default TurtleInfoPanel;
