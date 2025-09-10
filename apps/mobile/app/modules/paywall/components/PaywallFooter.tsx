import PrimaryButton from "@/app/components/PrimaryButton";
import React from "react";
import { Text, View } from "react-native";

interface PaywallFooterProps {
  onPurchase: () => void;
  onRestore?: () => void;
  isLoading?: boolean;
  selectedPlan?: string;
  hasTrial?: boolean;
  trialDays?: number;
}

const PaywallFooter: React.FC<PaywallFooterProps> = ({
  onPurchase,
  onRestore,
  isLoading = false,
  selectedPlan,
  hasTrial = false,
  trialDays,
}) => {
  return (
    <View className="px-6 pb-4">
      <PrimaryButton
        title={
          hasTrial && trialDays
            ? `Start ${trialDays}-Day Free Trial`
            : selectedPlan
            ? `Continue with ${selectedPlan}`
            : "Start Free Trial"
        }
        onPress={onPurchase}
        animating={isLoading}
        disabled={isLoading}
        className="mb-3"
      />

      {onRestore && (
        <Text
          onPress={onRestore}
          className="text-primary text-center text-sm font-nunito-medium mb-3"
        >
          Restore Purchases
        </Text>
      )}

      <View className="items-center">
        <Text className="text-textSecondary text-xs font-nunito text-center leading-4">
          By continuing, you agree to our{" "}
          <Text className="text-primary font-nunito-medium">
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text className="text-primary font-nunito-medium">
            Privacy Policy
          </Text>
          . Cancel anytime.
        </Text>
      </View>
    </View>
  );
};

export default PaywallFooter;
