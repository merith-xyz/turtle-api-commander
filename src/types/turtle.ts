
export interface TurtleInventoryItem {
  count?: number;
  displayName?: string;
  itemGroups?: {
    displayName: string;
    id: string;
  }[];
  maxCount?: number;
  name?: string;
  tags?: Record<string, boolean>;
}

export interface TurtlePosition {
  x: number;
  y: number;
  z: number;
  r: number;
  rname: string;
}

export interface TurtleFuel {
  current: number;
  max: number;
}

export interface TurtleSight {
  up: Record<string, unknown>;
  down: Record<string, unknown>;
  front: Record<string, unknown>;
}

export interface TurtleCommandResult {
  success: boolean;
  result: string | any;
}

export interface Turtle {
  name: string;
  id: number;
  inventory: TurtleInventoryItem[];
  selectedSlot: number;
  pos: TurtlePosition;
  fuel: TurtleFuel;
  sight: TurtleSight;
  cmdResult: [boolean, any]; // [success, result]
  cmdQueue: string[];
  misc: Record<string, unknown>;
  heartbeat: number; // UTC timestamp
}

// Add a utility function to check if a turtle is "dead" (hasn't sent heartbeat in 5+ seconds)
export function isTurtleOffline(turtle: Turtle): boolean {
  const currentTime = Date.now();
  const heartbeatTime = turtle.heartbeat * 1000; // Convert to milliseconds
  return currentTime - heartbeatTime > 5000; // 5 seconds
}

// Minecraft texture helper
export function getMinecraftTexturePath(resourceLocation: string): string {
  // If it doesn't start with assets/, prepend the full path
  if (!resourceLocation.startsWith('assets/')) {
    return `https://assets.mcasset.cloud/1.21.5/assets/minecraft/${resourceLocation}`;
  }
  return `https://assets.mcasset.cloud/1.21.5/${resourceLocation}`;
}

// Helper to get item texture
export function getMinecraftItemTexture(itemName: string): string {
  return getMinecraftTexturePath(`textures/item/${itemName}.png`);
}

// Helper to get block texture
export function getMinecraftBlockTexture(blockName: string): string {
  return getMinecraftTexturePath(`textures/block/${blockName}.png`);
}
