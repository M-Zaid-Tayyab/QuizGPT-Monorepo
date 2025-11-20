import * as Updates from "expo-updates";
import { useCallback, useEffect, useState } from "react";

export interface UpdateInfo {
  isAvailable: boolean;
  isChecking: boolean;
  isDownloading: boolean;
  isUpdateReady: boolean;
  error: string | null;
}

export function useExpoUpdates() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    isAvailable: false,
    isChecking: false,
    isDownloading: false,
    isUpdateReady: false,
    error: null,
  });

  const checkForUpdates = useCallback(async () => {
    if (__DEV__ || !Updates.isEnabled) {
      return;
    }

    try {
      setUpdateInfo((prev) => ({ ...prev, isChecking: true, error: null }));

      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setUpdateInfo((prev) => ({
          ...prev,
          isAvailable: true,
          isChecking: false,
          isDownloading: true,
        }));

        await Updates.fetchUpdateAsync();

        setUpdateInfo((prev) => ({
          ...prev,
          isDownloading: false,
          isUpdateReady: true,
        }));
      } else {
        setUpdateInfo((prev) => ({
          ...prev,
          isChecking: false,
          isAvailable: false,
        }));
      }
    } catch (error: any) {
      setUpdateInfo((prev) => ({
        ...prev,
        isChecking: false,
        isDownloading: false,
        error: error?.message || "Failed to check for updates",
      }));
    }
  }, []);

  const reloadApp = useCallback(async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {}
  }, []);

  const dismissUpdate = useCallback(() => {
    setUpdateInfo({
      isAvailable: false,
      isChecking: false,
      isDownloading: false,
      isUpdateReady: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    if (!__DEV__ && Updates.isEnabled) {
      const timer = setTimeout(() => {
        checkForUpdates();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [checkForUpdates]);

  return {
    updateInfo,
    checkForUpdates,
    reloadApp,
    dismissUpdate,
  };
}
