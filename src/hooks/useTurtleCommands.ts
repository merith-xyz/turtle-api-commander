
import { useState } from "react";
import { ResponseData } from "./useTurtleData";

interface UseTurtleCommandsProps {
  turtleId: number;
  apiBaseUrl: string;
  setLastCommandResponse: (response: ResponseData) => void;
  fetchTurtleData: (isInitialLoad: boolean) => Promise<void>;
  userInteracting: React.MutableRefObject<boolean>;
}

export const useTurtleCommands = ({
  turtleId,
  apiBaseUrl,
  setLastCommandResponse,
  fetchTurtleData,
  userInteracting
}: UseTurtleCommandsProps) => {
  
  const sendCommand = async (command: string | string[], isLuaScript = false) => {
    try {
      // Mark as interacting during command send
      userInteracting.current = true;
      
      // Record timestamp of the request
      const timestamp = new Date().toISOString();
      
      const url = `${apiBaseUrl}/turtle/${turtleId}`;
      let body: string;
      let headers: Record<string, string>;
      
      if (Array.isArray(command)) {
        // Array of commands
        headers = { "Content-Type": "application/json" };
        body = JSON.stringify(command);
      } else if (isLuaScript) {
        // Lua script
        headers = { "Content-Type": "text/plain" };
        body = command;
      } else {
        // Single command as JSON array
        headers = { "Content-Type": "application/json" };
        body = JSON.stringify([command]);
      }
      
      const requestInfo = {
        method: "POST",
        headers,
        body,
      };
      
      const response = await fetch(url, requestInfo);
      
      if (!response.ok) {
        // Handle non-200 responses
        const errorInfo = {
          status: response.status,
          statusText: response.statusText,
          type: "HttpError",
        };
        
        let errorData;
        try {
          // Try to parse error response as JSON
          errorData = await response.json();
        } catch (e) {
          // If can't parse as JSON, use text
          errorData = await response.text();
        }
        
        throw {
          message: `HTTP error ${response.status}: ${response.statusText}`,
          errorInfo,
          data: errorData,
        };
      }

      // Check if the response has a body before parsing
      const responseText = await response.text();
      const responseData = responseText ? JSON.parse(responseText) : null;

      const commandResponse: ResponseData = {
        data: responseData,
        timestamp,
        url,
        command,
        isLuaScript,
        requestInfo,
      };

      setLastCommandResponse(commandResponse);
      
      // Fetch the latest data right after sending a command
      setTimeout(() => {
        fetchTurtleData(false);
        userInteracting.current = false;
      }, 500);

      return Promise.resolve();
    } catch (error) {
      let errorInfo: any = {};
      let errorMessage = "";
      let errorData = null;
      
      if (error instanceof Error) {
        errorMessage = error.message;
        errorInfo.type = error.constructor.name;
        errorInfo.stack = error.stack;

        // For network errors (like DOMException)
        if ("code" in error) {
          errorInfo.code = (error as any).code;
        }
      } else if (typeof error === "object" && error !== null) {
        // Handle custom error objects we threw above
        errorMessage = (error as any).message || "Unknown error";
        errorInfo = (error as any).errorInfo || {};
        errorData = (error as any).data;
      } else {
        errorMessage = String(error);
      }

      // For fetch errors
      if (errorMessage === "Failed to fetch") {
        errorInfo.type = "NetworkError";
        errorInfo.details = "Connection to the server failed. The server might be down or unreachable.";
      }
      const commandErrorResponse: ResponseData = {
        data: errorData,
        error: errorMessage,
        errorInfo,
        timestamp: new Date().toISOString(),
        command,
        isLuaScript,
        url: `${apiBaseUrl}/turtle/${turtleId}`,
        requestInfo: {
          method: "POST",
          headers: isLuaScript
            ? { "Content-Type": "text/plain" }
            : { "Content-Type": "application/json" },
          body: typeof command === "string" && !isLuaScript
            ? JSON.stringify([command])
            : typeof command === "string"
            ? command
            : JSON.stringify(command),
        },
      };

      setLastCommandResponse(commandErrorResponse);

      userInteracting.current = false;
      return Promise.reject(error);
    }
  };

  return {
    sendCommand
  };
};
