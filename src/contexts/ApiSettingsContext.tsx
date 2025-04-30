
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ApiSettingsContextType {
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
}

const defaultApiBaseUrl = "http://localhost:3300/api";

export const ApiSettingsContext = createContext<ApiSettingsContextType>({
  apiBaseUrl: defaultApiBaseUrl,
  setApiBaseUrl: () => {},
});

export const ApiSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(() => {
    // Get from localStorage on initial load, or use default
    return localStorage.getItem('apiBaseUrl') || defaultApiBaseUrl;
  });

  // Save to localStorage whenever the URL changes
  useEffect(() => {
    localStorage.setItem('apiBaseUrl', apiBaseUrl);
  }, [apiBaseUrl]);

  return (
    <ApiSettingsContext.Provider value={{ apiBaseUrl, setApiBaseUrl }}>
      {children}
    </ApiSettingsContext.Provider>
  );
};

export const useApiSettings = () => useContext(ApiSettingsContext);
