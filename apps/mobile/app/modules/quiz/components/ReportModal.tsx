import PrimaryButton from "@/app/components/PrimaryButton";
import colors from "@/app/constants/colors";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";

interface ReportModalProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  onReport: (text: string) => void;
}

const ReportModal = ({ bottomSheetRef, onReport }: ReportModalProps) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        bottomSheetRef.current?.close();
        onReport?.(input);
        setInput("");
        setSuccess(false);
      }, 1200);
    }, 1500);
  }, [input, onReport]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["40%"]}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: colors.white }}
      backdropComponent={BottomSheetBackdrop}
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView className="flex-1 px-4 pb-6">
        <Text className="text-xl font-nunito-bold text-center mb-4">
          Report Question
        </Text>
        {success ? (
          <View className="items-center justify-center mt-[20%]">
            <Text className="text-success text-xl font-nunito-semibold mb-2">
              Report submitted!
            </Text>
            <Text className="text-textSecondary text-center font-nunito-semibold text-lg">
              Thank you for helping us keep QuizGPT safe.
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-base text-textSecondary font-nunito-semibold mb-2">
              What was inappropriate?
            </Text>
            <BottomSheetTextInput
              className="border border-borderColor rounded-lg p-3 min-h-[130px] text-base"
              placeholder="Describe the issue..."
              placeholderTextColor={colors.textSecondary}
              value={input}
              onChangeText={setInput}
              multiline
              editable={!loading}
              textAlignVertical="top"
            />
            <PrimaryButton
              title={loading ? "Submitting..." : "Submit Report"}
              onPress={handleSubmit}
              disabled={loading || !input.trim()}
              className="w-full mt-8"
            />
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
};

export default ReportModal;
