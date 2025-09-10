import SkeletonPlaceholder from "@/app/components/SkeltonPlaceholder";
import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { useMemo } from "react";
import { Text, View } from "react-native";

interface ExplanationSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  isLoading: boolean;
  error?: string | null;
  explanation?: string | null;
}

const ExplanationSheet: React.FC<ExplanationSheetProps> = ({
  bottomSheetRef,
  isLoading,
  error,
  explanation,
}) => {
  const snapPoints = useMemo(() => ["45%", "70%"], []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}
      backgroundStyle={{ backgroundColor: colors.white }}
      backdropComponent={BottomSheetBackdrop}
    >
      <BottomSheetScrollView className="flex-1 px-4 pb-6">
        <View className="flex-row items-center justify-center mb-6 mt-1">
          <Ionicons name="chatbubbles-outline" size={26} color={colors.black} />
          <Text className="ml-2 text-2xl font-nunito-bold text-textPrimary">
            Explanation
          </Text>
        </View>

        {isLoading ? (
          <View>
            <SkeletonPlaceholder className="h-32 rounded-lg w-full" />
            <SkeletonPlaceholder className="h-56 rounded-lg w-full mt-4" />
          </View>
        ) : error ? (
          <View className="items-center justify-center mt-[15%]">
            <Text className="text-error text-center font-nunito-semibold">
              {error}
            </Text>
          </View>
        ) : (
          <Text className="text-lg text-textPrimary font-nunito">
            {explanation || "No explanation available."}
          </Text>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default ExplanationSheet;
