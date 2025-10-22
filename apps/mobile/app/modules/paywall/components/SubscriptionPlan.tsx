import colors from "@/app/constants/colors";
import { FontAwesome6 } from "@expo/vector-icons";
import { clsx } from "clsx";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface SubscriptionPlanProps {
  title: string;
  price: string;
  period: string;
  originalPrice?: string;
  isPopular?: boolean;
  isSelected?: boolean;
  onSelect: () => void;
  savings?: string;
  introPrice?: string;
  introPeriod?: string;
  trialDays?: number;
  priceValue?: number;
  currencyCode?: string;
  showWeeklyCalculation?: boolean;
}

const SubscriptionPlan: React.FC<SubscriptionPlanProps> = ({
  title,
  price,
  period,
  originalPrice,
  isPopular = false,
  isSelected = false,
  onSelect,
  savings,
  introPrice,
  introPeriod,
  trialDays,
  priceValue,
  currencyCode,
  showWeeklyCalculation = false,
}) => {
  const hasTrial = introPrice && introPeriod && trialDays;

  const titleText =
    period === "week"
      ? "Weekly Plan"
      : period === "month"
      ? "Monthly Plan"
      : period === "year"
      ? "Yearly Plan"
      : "Weekly Plan";

  const shouldShowWeeklyCalc =
    showWeeklyCalculation &&
    period === "year" &&
    typeof priceValue === "number";

  const formattedWeeklyPrice = (() => {
    if (!shouldShowWeeklyCalc) return null;
    const weekly = priceValue! / 52;

    if (typeof price === "string" && price.trim().length > 0) {
      const trimmed = price.trim();
      const firstDigitIdx = trimmed.search(/[0-9]/);
      const lastDigitIdx = (() => {
        const m = trimmed.match(/.*([0-9])(?!.*[0-9])/);
        return m ? trimmed.lastIndexOf(m[1]) : -1;
      })();

      if (firstDigitIdx !== -1) {
        const prefix = trimmed.slice(0, firstDigitIdx);
        const suffix =
          lastDigitIdx !== -1 ? trimmed.slice(lastDigitIdx + 1) : "";
        const hasPrefixSymbol = prefix.trim().length > 0;
        const hasSuffixSymbol = suffix.trim().length > 0;
        const prefixHasSpace = /\s$/.test(prefix);
        const suffixHasSpace = /^\s/.test(suffix);

        const numberOnly = new Intl.NumberFormat(undefined, {
          maximumFractionDigits: 2,
        }).format(weekly);

        if (hasPrefixSymbol) {
          const symbol = prefix.trim();
          return `${symbol}${prefixHasSpace ? " " : ""}${numberOnly}`;
        }
        if (hasSuffixSymbol) {
          const symbol = suffix.trim();
          return `${numberOnly}${suffixHasSpace ? " " : ""}${symbol}`;
        }
      }
    }

    try {
      if (currencyCode) {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: currencyCode,
          currencyDisplay: "symbol",
          maximumFractionDigits: 2,
        }).format(weekly);
      }
    } catch {}

    return weekly.toFixed(2);
  })();

  const formattedBasePrice = price;

  return (
    <TouchableOpacity
      onPress={onSelect}
      className={`p-3 rounded-xl border-2 mb-6 ${
        isSelected
          ? "border-primary bg-primary/10"
          : "border-borderColor bg-white"
      }`}
    >
      {isPopular && (
        <View className="absolute -top-3 left-3 bg-primary px-2 py-0.5 rounded-full">
          <Text className="text-white text-sm font-nunito-semibold">
            BEST VALUE
          </Text>
        </View>
      )}

      <View
        className={clsx(
          "flex-row items-center justify-between",
          (isPopular || hasTrial) && "mt-1"
        )}
      >
        <View className="flex-1">
          <Text className="text-textPrimary text-xl font-nunito-semibold">
            {titleText}
          </Text>

          <View className="flex-row items-start justify-between">
            <Text className="text-textSecondary text-sm font-nunito flex-1">
              {period === "week"
                ? hasTrial
                  ? `${introPeriod} trial, cancel anytime, auto-renews`
                  : `7 days for ${price}, cancel anytime, auto-renews`
                : `12 months for ${price}, cancel anytime, auto-renews`}
            </Text>
            <View className="items-end">
              <View className="flex-row items-baseline">
                <Text className="text-textPrimary text-2xl font-nunito-bold">
                  {shouldShowWeeklyCalc && formattedWeeklyPrice
                    ? formattedWeeklyPrice
                    : formattedBasePrice}
                </Text>
                <Text className="text-textSecondary text-sm font-nunito ml-1">
                  {shouldShowWeeklyCalc || period === "week"
                    ? "/ week"
                    : "/ year"}
                </Text>
              </View>
            </View>
          </View>

          {originalPrice && (
            <Text className="text-textSecondary text-sm font-nunito line-through">
              {originalPrice}
            </Text>
          )}
        </View>
      </View>
      {isSelected && (
        <View className="w-7 h-7 rounded-full items-center justify-center border-primary bg-primary absolute -right-3 -top-3">
          <FontAwesome6 name="check" size={14} color={colors.white} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default SubscriptionPlan;
