/**
 * Utility functions for loading Minecraft textures
 */

// Base URL for Minecraft assets
const MINECRAFT_ASSETS_BASE_URL = "https://assets.mcasset.cloud/1.21.5";

/**
 * Get the URL for a Minecraft resource
 * @param resourceLocation The Minecraft resource location, e.g., "textures/block/stone.png"
 * @returns The full URL to the resource
 */
export const getMinecraftResourceUrl = (resourceLocation: string): string => {
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
  return getMinecraftResourceUrl(`textures/block/${blockName}.png`);
};

/**
 * Get the URL for a Minecraft item texture
 * @param itemName The item name without the .png extension, e.g., "diamond"
 * @returns The full URL to the item texture
 */
export const getMinecraftItemTexture = (itemName: string): string => {
  return getMinecraftResourceUrl(`textures/item/${itemName}.png`);
};

/**
 * A React hook to load a Minecraft texture with a fallback
 * @param resourceLocation The resource location to load
 * @param fallback Optional fallback URL if the texture can't be loaded
 * @returns An object with the loaded image URL and loading state
 */
export const useMinecraftTexture = (
  resourceLocation: string, 
  fallback: string = "/placeholder.svg"
): { url: string; isLoading: boolean; error: boolean } => {
  const [url, setUrl] = useState<string>(fallback);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  
  useEffect(() => {
    const textureUrl = getMinecraftResourceUrl(resourceLocation);
    const img = new Image();
    
    img.onload = () => {
      setUrl(textureUrl);
      setIsLoading(false);
      setError(false);
    };
    
    img.onerror = () => {
      setUrl(fallback);
      setIsLoading(false);
      setError(true);
    };
    
    img.src = textureUrl;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [resourceLocation, fallback]);
  
  return { url, isLoading, error };
};

// Forgot to import useState and useEffect
import { useState, useEffect } from "react";
