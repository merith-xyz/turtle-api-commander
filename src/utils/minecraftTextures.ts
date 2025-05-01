
/**
 * Utility functions for loading Minecraft textures
 */
import { useState, useEffect } from "react";

// Base URL for Minecraft assets
const MINECRAFT_ASSETS_BASE_URL = "https://assets.mcasset.cloud/1.21.5";

// Fallback render service URL - For showing 3D item models
const MC_RENDER_API = "https://mc-heads.net/item";

/**
 * Get the URL for a Minecraft resource
 * @param resourceLocation The Minecraft resource location, e.g., "textures/block/stone.png"
 * @returns The full URL to the resource
 */
export const getMinecraftResourceUrl = (resourceLocation: string): string => {
  if (!resourceLocation) return "";
  
  // If it already starts with 'assets', just append the base URL
  if (resourceLocation.startsWith("assets/")) {
    return `${MINECRAFT_ASSETS_BASE_URL}/${resourceLocation}`;
  }
  
  // Otherwise, assume it's relative to the Minecraft namespace
  return `${MINECRAFT_ASSETS_BASE_URL}/assets/minecraft/${resourceLocation}`;
};

/**
 * Get the URL for a Minecraft block texture
 * @param blockName The block name without the .png extension, e.g., "stone"
 * @returns The full URL to the block texture
 */
export const getMinecraftBlockTexture = (blockName: string): string => {
  if (!blockName) return "";
  return getMinecraftResourceUrl(`textures/block/${blockName}.png`);
};

/**
 * Get the URL for a Minecraft item texture
 * @param itemName The item name without the .png extension, e.g., "diamond"
 * @returns The full URL to the item texture
 */
export const getMinecraftItemTexture = (itemName: string): string => {
  if (!itemName) return "";
  return getMinecraftResourceUrl(`textures/item/${itemName}.png`);
};

/**
 * Get the URL for a Minecraft 3D item model render
 * @param itemName The full item name (can include minecraft: prefix)
 * @returns The URL to the rendered item model
 */
export const getMinecraftItemModel = (itemName: string): string => {
  if (!itemName) return "";
  
  // Strip the minecraft: prefix if present
  const pureName = itemName.replace("minecraft:", "");
  return `${MC_RENDER_API}/${pureName}`;
};

/**
 * A React hook to load a Minecraft texture with a fallback
 * @param resourceLocation The resource location to load
 * @param fallback Optional fallback URL if the texture can't be loaded
 * @param isItem Whether this is an item (use 3D model) or block (use flat texture)
 * @returns An object with the loaded image URL and loading state
 */
export const useMinecraftTexture = (
  resourceLocation: string, 
  fallback: string = "/placeholder.svg",
  isItem: boolean = false
): { url: string; isLoading: boolean; error: boolean } => {
  const [url, setUrl] = useState<string>(fallback);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  
  useEffect(() => {
    if (!resourceLocation) {
      setUrl(fallback);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(false);
    
    // Extract item/block name from resource location
    const resourceParts = resourceLocation.split("/");
    const nameWithExt = resourceParts[resourceParts.length - 1] || "";
    const itemName = nameWithExt.replace(".png", "");
    
    // For items, prioritize using the 3D model rendering service
    if (isItem && itemName) {
      const modelUrl = getMinecraftItemModel(itemName);
      const img = new Image();
      
      img.onload = () => {
        setUrl(modelUrl);
        setIsLoading(false);
      };
      
      img.onerror = () => {
        // If model fails, fall back to texture assets
        tryLoadTexture();
      };
      
      img.src = modelUrl;
      return;
    }
    
    // For blocks or if item model loading failed, try texture assets
    tryLoadTexture();
    
    function tryLoadTexture() {
      if (!resourceLocation) {
        setUrl(fallback);
        setIsLoading(false);
        setError(true);
        return;
      }
      
      const textureUrl = getMinecraftResourceUrl(resourceLocation);
      const img = new Image();
      
      img.onload = () => {
        setUrl(textureUrl);
        setIsLoading(false);
      };
      
      img.onerror = () => {
        setUrl(fallback);
        setIsLoading(false);
        setError(true);
      };
      
      img.src = textureUrl;
    }
  }, [resourceLocation, fallback, isItem]);
  
  return { url, isLoading, error };
};
