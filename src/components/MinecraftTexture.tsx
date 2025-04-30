
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
  isItem?: boolean;
}

const MinecraftTexture = ({
  resourceLocation,
  fallback = "/placeholder.svg",
  className = "",
  size = 32,
  alt = "Minecraft texture",
  tooltip,
  isItem = false
}: MinecraftTextureProps) => {
  const { url, isLoading, error } = useMinecraftTexture(resourceLocation, fallback, isItem);
  const [imgError, setImgError] = useState(false);
  
  const sizeStyle = typeof size === "number" ? `${size}px` : size;
  
  const imageElement = (
    <>
      {isLoading ? (
        <Skeleton className={`clip-edge ${className}`} style={{ width: sizeStyle, height: sizeStyle }} />
      ) : !resourceLocation ? (
        <img
          src={fallback}
          alt={alt}
          className={`clip-edge ${className}`}
          style={{
            width: sizeStyle,
            height: sizeStyle,
          }}
        />
      ) : (
        <img
          src={url}
          alt={alt}
          className={`clip-edge ${className} ${error || imgError ? "opacity-50" : ""}`}
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
