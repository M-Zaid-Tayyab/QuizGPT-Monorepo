import PrimaryButton from "@/app/components/PrimaryButton";
import colors from "@/app/constants/colors";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef } from "react";
import { Keyboard, Text, View } from "react-native";

interface ContinueLearningSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  onContinueLearning: (prompt: string) => void;
  onGoHome: () => void;
}

const ContinueLearningSheet: React.FC<ContinueLearningSheetProps> = ({
  bottomSheetRef,
  onContinueLearning,
  onGoHome,
}) => {
  const promptRef = useRef<string>("");

  const snapPoints = useMemo(() => ["40%"], []);

  const handleContinue = useCallback(() => {
    bottomSheetRef.current?.close();
    setTimeout(() => {
      onContinueLearning(promptRef.current?.trim());
    }, 400);
  }, [onContinueLearning, bottomSheetRef]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: colors.white }}
      backdropComponent={BottomSheetBackdrop}
      keyboardBlurBehavior="restore"
      onClose={() => {
        promptRef.current = "";
        Keyboard.dismiss();
      }}
    >
      <BottomSheetView className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-2xl font-nunito-bold text-textPrimary mb-2">
            Continue Learning
          </Text>
          <Text className="text-textSecondary text-base">
            Choose how you&apos;d like to continue your learning journey
          </Text>
        </View>

        <View className="flex-1">
          <BottomSheetTextInput
            onChangeText={(text) => {
              promptRef.current = text;
            }}
            placeholder="e.g., Give me harder questions, Focus on topics I got wrong..."
            placeholderTextColor="#9ca3af"
            className="border border-greyBackground rounded-2xl p-4 text-textPrimary font-nunito-medium h-40"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          className="w-full rounded-2xl mt-10 mb-safe"
        />
      </BottomSheetView>
    </BottomSheet>
  );
};

export default ContinueLearningSheet;
