
import { Turtle } from "../types/turtle";

// This will be imported dynamically in the components that use these functions
let API_BASE_URL = "https://skynet.merith.xyz/api";

// Function to update the API base URL
export const setApiBaseUrl = (url: string) => {
  API_BASE_URL = url;
};

export const fetchAllTurtles = async (): Promise<Turtle[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/turtle`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch turtles:", error);
    return [];
  }
};

export const fetchTurtle = async (id: number): Promise<Turtle | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/turtle/${id}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch turtle ${id}:`, error);
    return null;
  }
};

/**
 * Send command(s) to a turtle
 * @param id Turtle ID
 * @param input Either a single command string, an array of commands, or a Lua script
 * @param isLuaScript Set to true if input is a Lua script file
 */
export const sendTurtleCommand = async (
  id: number,
  input: string | string[],
  isLuaScript: boolean = false
): Promise<any> => {
  try {
    const url = `${API_BASE_URL}/turtle/${id}`;
    let body: string;
    const headers: Record<string, string> = {};
    
    // Determine format and set appropriate headers
    if (Array.isArray(input)) {
      // Array of commands as JSON
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(input);
    } else if (isLuaScript) {
      // Plain text Lua file
      headers["Content-Type"] = "text/plain";
      body = input;
    } else {
      // Single command as JSON array
      headers["Content-Type"] = "application/json";
      body = JSON.stringify([input]);
    }
    
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to send command to turtle ${id}:`, error);
    return null;
  }
};
