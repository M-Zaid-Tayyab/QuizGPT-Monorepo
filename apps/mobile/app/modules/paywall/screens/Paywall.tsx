import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import PrimaryButton from "@/app/components/PrimaryButton";
import colors from "@/app/constants/colors";
import { useSubscriptionManagement } from "@/app/hooks/useSubscriptionManagement";
import { useUserStore } from "../../auth/store/userStore";
import { FeatureItem, SubscriptionPlan } from "../components";
import { usePaywall } from "../hooks/usePaywall";

const Paywall: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useUserStore();
  const { manageSubscription } = useSubscriptionManagement();
  const {
    packages,
    isLoading,
    selectedPackage,
    setSelectedPackage,
    purchasePackage,
    restorePurchases,
    isPurchasing,
    showWeeklyCalculation,
  } = usePaywall();
  const [showCloseButton, setShowCloseButton] = useState(false);

  const features = [
    {
      icon: (
        <MaterialCommunityIcons name="robot" size={40} color={colors.primary} />
      ),
      title: "AI Powered Answers",
      description: "Get instant explanations to boost your exam performance.",
    },
    {
      icon: <Ionicons name="library" size={40} color={colors.primary} />,
      title: "Unlimited Flashcards",
      description:
        "Master every concept with spaced repetition for better retention.",
    },
    {
      icon: (
        <Ionicons name="checkbox-outline" size={40} color={colors.primary} />
      ),
      title: "Unlimited Quizzes",
      description:
        "Practice unlimited questions to ace your exams with confidence.",
    },
    {
      icon: <Ionicons name="layers" size={40} color={colors.primary} />,
      title: "Unlimited Study Sets",
      description:
        "Build comprehensive study materials tailored to your course and exam style.",
    },
  ];

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      (navigation as any).reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    }
  };

  const handlePlanSelect = (packageId: string) => {
    const pkg = packages.find((p) => p.identifier === packageId);
    if (pkg) {
      setSelectedPackage(pkg);
    }
  };

  const getPeriodText = (packageType: string) => {
    switch (packageType) {
      case "WEEKLY":
        return "week";
      case "ANNUAL":
        return "year";
      default:
        return "period";
    }
  };

  const getSavings = (pkg: any) => {
    if (pkg.packageType === "ANNUAL") {
      const weeklyPackage = packages.find((p) => p.packageType === "WEEKLY");
      if (!weeklyPackage || weeklyPackage.product.price === 0) {
        return undefined;
      }
      const weeklyPrice = weeklyPackage.product.price;
      const yearlyPrice = pkg.product.price;
      const weeksInYear = 52;
      const totalWeeklyCost = weeklyPrice * weeksInYear;
      const savings = ((totalWeeklyCost - yearlyPrice) / totalWeeklyCost) * 100;
      return `${Math.round(savings)}%`;
    }
    return undefined;
  };

  useEffect(() => {
    setTimeout(() => {
      setShowCloseButton(true);
    }, 5000);
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="py-safe px-4 bg-background flex-grow"
    >
      <View className="flex-row items-center justify-between mt-2">
        <View className="w-10" />
        <View className="flex-row items-center">
          <Text className="text-textPrimary text-4xl font-nunito-bold mr-2">
            QuizGPT
          </Text>
          <View className="bg-primary px-3 py-1 rounded-full">
            <Text className="text-white text-xl font-nunito-bold">Pro</Text>
          </View>
        </View>
        {showCloseButton ? (
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View className="w-6" />
        )}
      </View>

      <View className="mt-10">
        {features.map((feature, index) => (
          <FeatureItem
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </View>

      <View className="mt-4">
        {isLoading && packages.length === 0 ? (
          <View className="items-center py-8">
            <Text className="text-textSecondary text-base font-nunito">
              Loading subscription options...
            </Text>
          </View>
        ) : packages.length > 0 ? (
          packages.map((pkg) => (
            <SubscriptionPlan
              key={pkg.identifier}
              title={pkg.product.title}
              price={pkg.product.priceString}
              priceValue={pkg.product.price}
              period={getPeriodText(pkg.packageType)}
              isPopular={pkg.packageType === "ANNUAL"}
              isSelected={selectedPackage?.identifier === pkg.identifier}
              onSelect={() => handlePlanSelect(pkg.identifier)}
              savings={getSavings(pkg)}
              introPrice={pkg.product.introPrice}
              introPeriod={pkg.product.introPeriod}
              trialDays={pkg.product.trialDays}
              currencyCode={pkg.product.currencyCode}
              showWeeklyCalculation={showWeeklyCalculation}
            />
          ))
        ) : (
          <View className="items-center py-8">
            <Text className="text-textSecondary text-base font-nunito">
              No subscription options available
            </Text>
          </View>
        )}
      </View>

      <View className="mt-6">
        <PrimaryButton
          title={
            user?.isProUser
              ? "Manage Subscription"
              : isPurchasing
              ? "Processing..."
              : selectedPackage
              ? selectedPackage.product.trialDays
                ? `Start ${selectedPackage.product.trialDays}-Day Free Trial`
                : selectedPackage.packageType === "ANNUAL"
                ? getSavings(selectedPackage)
                  ? `Unlock and save ${getSavings(selectedPackage)}`
                  : "Unlock Premium Features"
                : `Start Weekly Plan`
              : "Select a Plan"
          }
          onPress={user?.isProUser ? manageSubscription : purchasePackage}
          disabled={isPurchasing || (!selectedPackage && !user?.isProUser)}
        />

        <View className="flex-row justify-center items-center mt-4">
          <Text
            className="text-primary text-sm font-nunito-semibold"
            onPress={restorePurchases}
          >
            Restore Purchases
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default Paywall;
