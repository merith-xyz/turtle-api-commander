
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileCode, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LuaScriptEditorProps {
  onSendScript: (script: string) => Promise<void>;
}

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

const LuaScriptEditor = ({ onSendScript }: LuaScriptEditorProps) => {
  const [luaScript, setLuaScript] = useState(DEFAULT_SCRIPT);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
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
        await onSendScript(scriptWithReturn);
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
      await onSendScript(luaScript);
      toast({
        title: "Lua script sent",
        description: "Script sent successfully",
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
  
  return (
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
  );
};

export default LuaScriptEditor;
