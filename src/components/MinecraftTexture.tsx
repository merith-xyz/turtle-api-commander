
import { useMinecraftTexture } from "@/utils/minecraftTextures";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui/hover-card";

interface MinecraftTextureProps {
  resourceLocation: string;
  fallback?: string;
  className?: string;
  size?: number | string;
  alt?: string;
  tooltip?: string | React.ReactNode;
  hoverCard?: React.ReactNode;
  isItem?: boolean;
}

const MinecraftTexture = ({
  resourceLocation,
  fallback = "/placeholder.svg",
  className = "",
  size = 32,
  alt = "Minecraft texture",
  tooltip,
  hoverCard,
  isItem = false
}: MinecraftTextureProps) => {
  const { url, isLoading, error } = useMinecraftTexture(resourceLocation, fallback, isItem);
  const [imgError, setImgError] = useState(false);
  
  // Size style handling - Convert numerical size to pixels or use directly if string
  const sizeStyle = typeof size === "number" ? `${size}px` : size;
  const dimensions = { 
    width: sizeStyle, 
    height: sizeStyle 
  };
  
  const imageElement = (
    <>
      {isLoading ? (
        <Skeleton 
          className={`clip-edge ${className}`} 
          style={{ width: dimensions.width, height: dimensions.height }} 
        />
      ) : (
        <img
          src={url}
          alt={alt}
          className={`clip-edge ${className} ${error || imgError ? "opacity-50" : ""}`}
          style={{
            ...dimensions,
            imageRendering: isItem ? "auto" : "pixelated",
            objectFit: "contain"
          }}
          onError={() => setImgError(true)}
        />
      )}
    </>
  );
  
  // If hoverCard is provided, wrap in HoverCard component
  if (hoverCard) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="inline-block cursor-help">
            {imageElement}
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="clip-edge border-slate-700 bg-slate-800 text-slate-200 shadow-lg p-0 w-80">
          {hoverCard}
        </HoverCardContent>
      </HoverCard>
    );
  }
  
  // If tooltip is provided, wrap in tooltip component
  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-block cursor-help">
              {imageElement}
            </div>
          </TooltipTrigger>
          <TooltipContent className="clip-edge border-slate-700 bg-slate-800">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return imageElement;
};

export default MinecraftTexture;
