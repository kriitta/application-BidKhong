import React, { createContext, useCallback, useContext, useState } from "react";

interface AppReadyContextType {
  isHomeReady: boolean;
  markHomeReady: () => void;
}

const AppReadyContext = createContext<AppReadyContextType>({
  isHomeReady: false,
  markHomeReady: () => {},
});

export const useAppReady = () => useContext(AppReadyContext);

export const AppReadyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isHomeReady, setIsHomeReady] = useState(false);

  const markHomeReady = useCallback(() => {
    setIsHomeReady(true);
  }, []);

  return (
    <AppReadyContext.Provider value={{ isHomeReady, markHomeReady }}>
      {children}
    </AppReadyContext.Provider>
  );
};
