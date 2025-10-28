import { useAppFlags } from "@/app/hooks/useAppFlags";
import * as Application from "expo-application";
import { useCallback, useEffect, useState } from "react";
import { Alert, Linking, Platform } from "react-native";

interface AppVersionInfo {
  currentVersion: string;
  minimumVersion: string;
  latestVersion: string;
  forceUpdate: boolean;
}

interface UseForceUpdateReturn {
  shouldForceUpdate: boolean;
  versionInfo: AppVersionInfo | null;
  isLoading: boolean;
  checkForUpdate: () => Promise<void>;
  openAppStore: () => void;
}

export const useForceUpdate = (): UseForceUpdateReturn => {
  const [shouldForceUpdate, setShouldForceUpdate] = useState(false);
  const [versionInfo, setVersionInfo] = useState<AppVersionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: appFlags } = useAppFlags();

  const getCurrentVersion = (): string => {
    return Application.nativeApplicationVersion || "1.0.0";
  };

  const compareVersions = (current: string, minimum: string): boolean => {
    const currentParts = current.split(".").map(Number);
    const minimumParts = minimum.split(".").map(Number);

    for (
      let i = 0;
      i < Math.max(currentParts.length, minimumParts.length);
      i++
    ) {
      const currentPart = currentParts[i] || 0;
      const minimumPart = minimumParts[i] || 0;

      if (currentPart < minimumPart) {
        return false;
      } else if (currentPart > minimumPart) {
        return true;
      }
    }

    return true;
  };

  const checkForUpdate = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      const currentVersion = getCurrentVersion();

      const minimumVersion = appFlags?.version?.minimumVersion || "1.0.0";
      const latestVersion = appFlags?.version?.latestVersion || currentVersion;
      const forceUpdateEnabled = appFlags?.version?.forceUpdate || false;

      const versionData: AppVersionInfo = {
        currentVersion,
        minimumVersion,
        latestVersion,
        forceUpdate: forceUpdateEnabled,
      };

      setVersionInfo(versionData);

      const meetsMinimumVersion = compareVersions(
        currentVersion,
        minimumVersion
      );

      if (!meetsMinimumVersion && forceUpdateEnabled) {
        setShouldForceUpdate(true);
      } else {
        setShouldForceUpdate(false);
      }
    } catch (error) {
      console.error("Error checking for app update:", error);
      setShouldForceUpdate(false);
    } finally {
      setIsLoading(false);
    }
  }, [appFlags]);

  const openAppStore = (): void => {
    const appStoreUrl = Platform.select({
      ios: "https://apps.apple.com/app/quizgpt/id123456789",
      android: "https://play.google.com/store/apps/details?id=com.quizgpt.app",
    });

    if (appStoreUrl) {
      Linking.openURL(appStoreUrl).catch((error) => {
        console.error("Failed to open app store:", error);
        Alert.alert(
          "Update Required",
          "Please update the app from the App Store to continue using QuizGPT.",
          [
            {
              text: "OK",
              onPress: () => {},
            },
          ]
        );
      });
    }
  };

  useEffect(() => {
    if (appFlags) {
      checkForUpdate();
    }
  }, [appFlags, checkForUpdate]);

  return {
    shouldForceUpdate,
    versionInfo,
    isLoading,
    checkForUpdate,
    openAppStore,
  };
};
