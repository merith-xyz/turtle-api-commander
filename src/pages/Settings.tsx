
import React, { useState } from "react";
import { useApiSettings } from "@/contexts/ApiSettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";

const Settings = () => {
  const { apiBaseUrl, setApiBaseUrl } = useApiSettings();
  const [inputUrl, setInputUrl] = useState(apiBaseUrl);
  const { toast } = useToast();

  const handleSave = () => {
    // Ensure the URL ends with /api
    const formattedUrl = inputUrl.endsWith('/api') 
      ? inputUrl 
      : inputUrl.endsWith('/') 
        ? `${inputUrl}api` 
        : `${inputUrl}/api`;
    
    setApiBaseUrl(formattedUrl);
    toast({
      title: "Settings saved",
      description: `API base URL set to ${formattedUrl}`,
    });
  };

  const handleReset = () => {
    const defaultUrl = "http://localhost:3300/api";
    setInputUrl(defaultUrl);
    setApiBaseUrl(defaultUrl);
    toast({
      title: "Settings reset",
      description: "API base URL reset to default",
    });
  };

  return (
    <div className="min-h-screen bg-background turtle-bg-pattern">
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-6 text-foreground">Settings</h1>
        
        <Card className="max-w-2xl mx-auto border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiUrl" className="text-sm font-medium text-foreground">
                API Base URL
              </label>
              <Input
                id="apiUrl"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter API base URL"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Example: http://localhost:3300 or https://skynet.merith.xyz
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleReset}>
                Reset to Default
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
