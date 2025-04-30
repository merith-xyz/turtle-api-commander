
import { useMinecraftTexture } from "@/utils/minecraftTextures";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface MinecraftTextureProps {
  resourceLocation: string;
  fallback?: string;
  className?: string;
  size?: number | string;
  alt?: string;
}

const MinecraftTexture = ({
  resourceLocation,
  fallback = "/placeholder.svg",
  className = "",
  size = 32,
  alt = "Minecraft texture",
}: MinecraftTextureProps) => {
  const { url, isLoading, error } = useMinecraftTexture(resourceLocation, fallback);
  const [imgError, setImgError] = useState(false);
  
  const sizeStyle = typeof size === "number" ? `${size}px` : size;
  
  if (isLoading) {
    return <Skeleton className={className} style={{ width: sizeStyle, height: sizeStyle }} />;
  }
  
  // If the resource location is empty, show the fallback
  if (!resourceLocation) {
    return (
      <img
        src={fallback}
        alt={alt}
        className={className}
        style={{
          width: sizeStyle,
          height: sizeStyle,
        }}
      />
    );
  }
  
  return (
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
  );
};

export default MinecraftTexture;
