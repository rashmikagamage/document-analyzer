import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { DriveFile } from "../api/drive";

type DashboardCache = {
  authenticated: boolean | null;
  files: DriveFile[];
  hasLoaded: boolean;
  setAuthenticated: (value: boolean | null) => void;
  setFiles: (files: DriveFile[]) => void;
  setHasLoaded: (value: boolean) => void;
  clearDashboardCache: () => void;
};

const DashboardContext = createContext<DashboardCache | null>(null);

export function DashboardProvider({ children }: PropsWithChildren) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  function clearDashboardCache() {
    setAuthenticated(null);
    setFiles([]);
    setHasLoaded(false);
  }

  const value = useMemo(
    () => ({
      authenticated,
      files,
      hasLoaded,
      setAuthenticated,
      setFiles,
      setHasLoaded,
      clearDashboardCache,
    }),
    [authenticated, files, hasLoaded]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardCache() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboardCache must be used within DashboardProvider");
  }

  return context;
}