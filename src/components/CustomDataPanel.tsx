
import React from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

type MiscDataType = "string" | "number" | "table";

interface MiscDataFormValues {
  key: string;
  type: MiscDataType;
  value: string;
}

interface CustomDataPanelProps {
  miscData: Record<string, any>;
  onAddData: (key: string, value: any, type: MiscDataType) => Promise<void>;
}

const CustomDataPanel = ({ miscData, onAddData }: CustomDataPanelProps) => {
  const { toast } = useToast();
  
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
    
    onAddData(data.key, valueToSet, data.type)
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
    <div className="space-y-4">
      {/* Add Data Form */}
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
            <Plus className="h-3 w-3 mr-1" />
            Add to ultron.data.misc
          </Button>
        </form>
      </Form>
      
      {/* View Data Section */}
      {Object.keys(miscData).length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Stored Data:</div>
          <div className="bg-muted p-2 rounded-md max-h-48 overflow-y-auto clip-edge-sm">
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(miscData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDataPanel;
