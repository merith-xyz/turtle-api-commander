
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

export interface Turtle {
  name: string;
  id: number;
  inventory: TurtleInventoryItem[];
  selectedSlot: number;
  pos: TurtlePosition;
  fuel: TurtleFuel;
  sight: TurtleSight;
  cmdResult: Record<string, unknown>;
  cmdQueue: any;
  misc: Record<string, unknown>;
  heartbeat: number;
}
