
import React from "react";

interface CommandQueueDisplayProps {
  commands: string[];
}

const CommandQueueDisplay = ({ commands }: CommandQueueDisplayProps) => {
  if (commands.length === 0) return null;
  
  return (
    <div className="bg-muted p-2 rounded-md max-h-32 overflow-y-auto clip-edge-sm">
      <ul className="text-xs space-y-1">
        {commands.map((cmd, idx) => (
          <li key={idx} className="font-mono">
            {idx + 1}. {cmd}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommandQueueDisplay;
