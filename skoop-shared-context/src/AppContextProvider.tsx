import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

enum PersistedDataType {
  ACCESS_TOKEN = "ACCESS_TOKEN",
  SKOOP_PERMISSIONS = "skoop-permissions",
}

const getPersistedData = (requiredKey?: PersistedDataType): any => {
  try {
    const persistData = localStorage.getItem(
      `persist:skoop-main-app`
    );
    if (requiredKey) {
      const parsedData = JSON.parse(persistData as string);
      if (requiredKey === PersistedDataType.ACCESS_TOKEN)
        return JSON.parse(parsedData.user).tokens?.accessToken;
      if (requiredKey === PersistedDataType.SKOOP_PERMISSIONS)
        return JSON.parse(parsedData.user)?.permissions;
    }
    return JSON.parse(persistData as string);
  } catch {
    return null;
  }
};

export const AppContext = createContext<{
  checkPermission: (requiredPermission: string) => boolean;
} | null>(null);

export const AppContextProvider = ({
  children,
}: {
  children: ReactNode | ReactNode[];
}) => {
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const permissions =
      getPersistedData(PersistedDataType.SKOOP_PERMISSIONS) || [];
    setPermissions(permissions);
  }, []);

  return (
    <AppContext.Provider
      value={useMemo(
        () => ({
          checkPermission: (requiredPermission: string) => {
            return permissions?.includes(requiredPermission);
          },
        }),
        [permissions]
      )}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useAppContext must be used within a AppContextProvider");
  }
  return context;
};
