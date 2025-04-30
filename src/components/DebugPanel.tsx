import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, AlertCircle, ArrowDownToLine, ArrowUpToLine } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DebugPanelProps {
  data: any;
  title?: string;
}

const DebugPanel = ({ data, title = "Debug Data" }: DebugPanelProps) => {
  const [isLeftExpanded, setIsLeftExpanded] = useState(false);
  const [isRightExpanded, setIsRightExpanded] = useState(false);
  const hasError = data?.error;

  // Determine if this is a sent command or received response
  const isSentCommand = Boolean(data?.command);
  
  // Initialize with last response for both views - we'll split the UI but keep a single data source
  const sentData = isSentCommand ? data : null;
  const receivedData = isSentCommand ? null : data;

  // Use the most recent data for display (either sent or received)
  const displayData = data;

  const toggleLeftExpand = () => {
    setIsLeftExpanded(!isLeftExpanded);
  };

  const toggleRightExpand = () => {
    setIsRightExpanded(!isRightExpanded);
  };

  const renderDataContent = (data: any, isExpanded: boolean, toggleExpand: () => void, title: string) => {
    if (!data) return null;
    
    const hasError = data?.error;
    
    return (
      <Card className="overflow-hidden h-full">
        <div className={`p-4 ${hasError ? "bg-red-50" : "bg-muted/50"}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
              <h3 className={`font-medium text-sm ${hasError ? "text-red-700" : ""}`}>
                {title}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpand}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isExpanded ? "Hide" : "Show"} Debug Data
              </span>
            </Button>
          </div>
        </div>

        {isExpanded && (
          <ScrollArea className="h-[calc(100%-48px)]">
            <div>
              {hasError && (
                <Alert variant="destructive" className="mx-4 mt-4 mb-0">
                  <AlertTitle>{data.error}</AlertTitle>
                  {data.errorInfo?.details && (
                    <AlertDescription>
                      {data.errorInfo.details}
                    </AlertDescription>
                  )}
                </Alert>
              )}
              
              <Tabs defaultValue="raw" className="p-4">
                <TabsList>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                  {data.requestInfo && <TabsTrigger value="request">Request</TabsTrigger>}
                  {data.errorInfo && <TabsTrigger value="error">Error Details</TabsTrigger>}
                </TabsList>
                
                <TabsContent value="raw" className="mt-2">
                  <div className="max-h-96 overflow-auto bg-black p-4 rounded-md">
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </div>
                </TabsContent>
                
                {data.requestInfo && (
                  <TabsContent value="request" className="mt-2">
                    <div className="max-h-96 overflow-auto bg-slate-800 p-4 rounded-md">
                      <pre className="text-xs text-blue-300 font-mono whitespace-pre-wrap">
                        {`${data.requestInfo.method} ${data.url}
Headers: ${JSON.stringify(data.requestInfo.headers, null, 2)}${data.requestInfo.body ? '\nBody: ' + data.requestInfo.body : ''}`}
                      </pre>
                    </div>
                  </TabsContent>
                )}
                
                {data.errorInfo && (
                  <TabsContent value="error" className="mt-2">
                    <div className="max-h-96 overflow-auto bg-red-900 p-4 rounded-md">
                      <pre className="text-xs text-red-200 font-mono whitespace-pre-wrap">
                        {`Error Type: ${data.errorInfo.type || 'Unknown'}
${data.errorInfo.status ? 'Status: ' + data.errorInfo.status + ' ' + (data.errorInfo.statusText || '') : ''}
${data.errorInfo.code ? 'Code: ' + data.errorInfo.code : ''}
${data.errorInfo.details ? 'Details: ' + data.errorInfo.details : ''}
${data.errorInfo.stack ? '\nStack Trace:\n' + data.errorInfo.stack : ''}`}
                      </pre>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </ScrollArea>
        )}
      </Card>
    );
  };

  // If there's no data to display in either panel, show a simplified view
  if (!sentData && !receivedData) {
    return renderDataContent(displayData, isLeftExpanded, toggleLeftExpand, title);
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-[200px] mb-4">
      <ResizablePanel defaultSize={50} minSize={30}>
        {renderDataContent(
          receivedData || displayData, 
          isLeftExpanded, 
          toggleLeftExpand, 
          receivedData ? `API Response (${receivedData.timestamp})` : "API Responses"
        )}
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={50} minSize={30}>
        {renderDataContent(
          sentData, 
          isRightExpanded, 
          toggleRightExpand, 
          sentData ? `Command Response (${sentData.timestamp})` : "Command Responses"
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default DebugPanel;
