import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import { usePaywallStore } from "../store/paywallStore";

interface SubscriptionPackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    title: string;
    description: string;
    price: number;
    priceString: string;
    introPrice?: string;
    introPeriod?: string;
    trialDays?: number;
    currencyCode?: string;
  };
}

interface UsePaywallReturn {
  packages: SubscriptionPackage[];
  isLoading: boolean;
  selectedPackage: SubscriptionPackage | null;
  setSelectedPackage: (pkg: SubscriptionPackage) => void;
  purchasePackage: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  isPurchasing: boolean;
}

export const usePaywall = (): UsePaywallReturn => {
  const navigation = useNavigation();
  const { packages, setPackages } = usePaywallStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] =
    useState<SubscriptionPackage | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  let timeout: any;
  useEffect(() => {
    const checkRevenueCat = async () => {
      const isConfigured = await Purchases.isConfigured();
      if (isConfigured) {
        loadOfferings();
        return;
      } else {
        timeout = setTimeout(() => {
          checkRevenueCat();
        }, 1000);
      }
    };
    checkRevenueCat();
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const loadOfferings = async () => {
    try {
      setIsLoading(true);

      const offerings = await Purchases.getOfferings();

      console.log("Offerings: ", JSON.stringify(offerings));

      if (offerings.current) {
        const availablePackages = offerings.current.availablePackages;

        let allPackages: PurchasesPackage[] = [...availablePackages];

        if (
          offerings.all &&
          offerings.all.yearly_pro &&
          offerings.all.yearly_pro.availablePackages
        ) {
          allPackages = [
            ...availablePackages,
            ...offerings.all.yearly_pro.availablePackages,
          ];
        }

        const convertedPackages: SubscriptionPackage[] = allPackages.map(
          (pkg: PurchasesPackage) => {
            const packageType = getPackageType(pkg.packageType);

            const hasIntroPrice = pkg.product.introPrice !== null;
            let introPrice = undefined;
            let introPeriod = undefined;
            let trialDays = undefined;

            if (hasIntroPrice) {
              introPrice = "Free";
              if (packageType === "WEEKLY") {
                trialDays = 3;
                introPeriod = "3 days free";
              } else if (packageType === "ANNUAL") {
                trialDays = 14;
                introPeriod = "14 days free";
              }
            }

            return {
              identifier: pkg.identifier,
              packageType,
              product: {
                identifier: pkg.product.identifier,
                title: pkg.product.title.split("(")[0] || "QuizGPT Pro",
                description:
                  pkg.product.description ||
                  `${packageType.toLowerCase()} subscription to premium features`,
                price: pkg.product.price,
                priceString: pkg.product.priceString,
                currencyCode: pkg.product.currencyCode,
                introPrice,
                introPeriod,
                trialDays,
              },
            };
          }
        );

        setPackages(convertedPackages);

        const yearlyPackage = convertedPackages.find(
          (pkg) => pkg.packageType === "ANNUAL"
        );
        const weeklyPackage = convertedPackages.find(
          (pkg) => pkg.packageType === "WEEKLY"
        );
        const defaultPackage =
          yearlyPackage || weeklyPackage || convertedPackages[0];
        setSelectedPackage(defaultPackage || null);
      } else {
        console.warn("No current offering available");
        Alert.alert("Error", "No subscription options available at the moment");
      }
    } catch (error) {
      console.error("Error loading offerings:", error);
      Alert.alert(
        "Error",
        "Failed to load subscription options. Please check your internet connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getPackageType = (packageType: string): string => {
    switch (packageType) {
      case "WEEKLY":
        return "WEEKLY";
      case "MONTHLY":
        return "MONTHLY";
      case "ANNUAL":
      case "YEARLY":
        return "ANNUAL";
      default:
        return packageType.toUpperCase();
    }
  };

  const purchasePackage = async () => {
    if (!selectedPackage) {
      Alert.alert("Error", "Please select a subscription plan");
      return;
    }

    try {
      setIsPurchasing(true);

      const offerings = await Purchases.getOfferings();
      if (!offerings.current) {
        throw new Error("No current offering available");
      }

      let revenueCatPackage = offerings.current.availablePackages.find(
        (pkg: PurchasesPackage) => pkg.identifier === selectedPackage.identifier
      );

      if (!revenueCatPackage && offerings.all) {
        if (
          offerings.all.yearly_pro &&
          offerings.all.yearly_pro.availablePackages
        ) {
          revenueCatPackage = offerings.all.yearly_pro.availablePackages.find(
            (pkg: PurchasesPackage) =>
              pkg.identifier === selectedPackage.identifier
          );
        }
      }

      if (!revenueCatPackage) {
        throw new Error("Selected package not found");
      }

      const { customerInfo } = await Purchases.purchasePackage(
        revenueCatPackage
      );

      if (customerInfo.entitlements.active["pro_quizgpt"]) {
        const trialMessage = selectedPackage.product.trialDays
          ? `Your ${selectedPackage.product.trialDays}-day free trial has started! After the trial, you'll be charged ${selectedPackage.product.priceString}.`
          : "Your subscription is now active. Enjoy unlimited access to all features!";

        Alert.alert("Welcome to Premium! 🎉", trialMessage, [
          {
            text: "Continue",
            onPress: () => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("Main");
              }
            },
          },
        ]);
      } else {
        Alert.alert("Purchase Complete", "Thank you for your purchase!", [
          {
            text: "Continue",
            onPress: () => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("Main");
              }
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error("Purchase error:", error);

      if (error.userCancelled) {
        return;
      }

      if (error.code === "NETWORK_ERROR") {
        Alert.alert(
          "Network Error",
          "Please check your internet connection and try again."
        );
      } else if (error.code === "PURCHASE_CANCELLED_ERROR") {
        return;
      } else if (error.code === "PURCHASE_INVALID_ERROR") {
        Alert.alert(
          "Purchase Error",
          "This purchase is not valid. Please try again."
        );
      } else {
        Alert.alert(
          "Purchase Failed",
          "Something went wrong with your purchase. Please try again."
        );
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const restorePurchases = async () => {
    try {
      setIsLoading(true);

      const customerInfo = await Purchases.restorePurchases();

      if (customerInfo.entitlements.active["pro_quizgpt"]) {
        Alert.alert(
          "Purchases Restored! 🎉",
          "Your premium subscription has been restored successfully!",
          [
            {
              text: "Continue",
              onPress: () => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate("Main" as never);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "No Active Purchases",
          "No active premium subscriptions found to restore.",
          [{ text: "OK", onPress: () => {} }]
        );
      }
    } catch (error) {
      console.error("Restore error:", error);
      Alert.alert(
        "Restore Failed",
        "Failed to restore purchases. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    packages,
    isLoading,
    selectedPackage,
    setSelectedPackage,
    purchasePackage,
    restorePurchases,
    isPurchasing,
  };
};
