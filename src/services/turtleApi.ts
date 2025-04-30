
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

export const sendTurtleCommand = async (
  id: number, 
  command: string
): Promise<any> => {
  try {
    // This is a placeholder - the actual endpoint and payload structure 
    // would depend on how the turtle API is implemented
    const response = await fetch(`${API_BASE_URL}/turtle/${id}/command`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command }),
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
