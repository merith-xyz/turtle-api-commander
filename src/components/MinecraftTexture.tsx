
import { useMinecraftTexture } from "@/utils/minecraftTextures";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface MinecraftTextureProps {
  resourceLocation: string;
  fallback?: string;
  className?: string;
  size?: number | string;
  alt?: string;
  tooltip?: string | React.ReactNode;
}

const MinecraftTexture = ({
  resourceLocation,
  fallback = "/placeholder.svg",
  className = "",
  size = 32,
  alt = "Minecraft texture",
  tooltip
}: MinecraftTextureProps) => {
  const { url, isLoading, error } = useMinecraftTexture(resourceLocation, fallback);
  const [imgError, setImgError] = useState(false);
  
  const sizeStyle = typeof size === "number" ? `${size}px` : size;
  
  const imageElement = (
    <>
      {isLoading ? (
        <Skeleton className={className} style={{ width: sizeStyle, height: sizeStyle }} />
      ) : !resourceLocation ? (
        <img
          src={fallback}
          alt={alt}
          className={className}
          style={{
            width: sizeStyle,
            height: sizeStyle,
          }}
        />
      ) : (
        <img
          src={url}
          alt={alt}
          className={`${className} ${error || imgError ? "opacity-50" : ""}`}
          style={{
            width: sizeStyle,
            height: sizeStyle,
            imageRendering: "pixelated",
          }}
          onError={() => setImgError(true)}
        />
      )}
    </>
  );
  
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
          <TooltipContent>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return imageElement;
};

export default MinecraftTexture;
