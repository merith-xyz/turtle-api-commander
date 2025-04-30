
import { useMinecraftTexture } from "@/utils/minecraftTextures";
import { Skeleton } from "@/components/ui/skeleton";

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
  
  const sizeStyle = typeof size === "number" ? `${size}px` : size;
  
  if (isLoading) {
    return <Skeleton className={className} style={{ width: sizeStyle, height: sizeStyle }} />;
  }
  
  return (
    <img
      src={url}
      alt={alt}
      className={`${className} ${error ? "opacity-50" : ""}`}
      style={{
        width: sizeStyle,
        height: sizeStyle,
        imageRendering: "pixelated",
      }}
    />
  );
};

export default MinecraftTexture;
