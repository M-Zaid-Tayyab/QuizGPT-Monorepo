import PrimaryButton from "@/app/components/PrimaryButton";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useMemo, useState } from "react";
import { Alert, Text } from "react-native";

interface FeatureSheetProps {
  featureSheetRef: React.RefObject<BottomSheetModal | null>;
}

const SheetContent = (props: any) => {
  const [feature, setFeature] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!feature.trim()) {
      Alert.alert("Please enter a feature request.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setFeature("");
      Alert.alert("Thank you!", "Your feature request has been submitted.");
      props.featureSheetRef.current?.close();
    }, 1000);
  };
  return (
    <>
      <Text className="text-xl font-nunito-bold text-center mb-4">
        Feature Request
      </Text>
      <Text className="text-base text-textSecondary font-nunito-semibold mb-2 text-center">
        What feature would you love and pay for? Let us know!
      </Text>
      <BottomSheetTextInput
        className="border border-borderColor rounded-lg p-3 min-h-[130px] text-base"
        placeholder="Describe your feature..."
        placeholderTextColor="#6B7280"
        value={feature}
        onChangeText={setFeature}
        multiline
        editable={!submitting}
        textAlignVertical="top"
      />
      <PrimaryButton
        title="Submit"
        onPress={handleSubmit}
        className="mt-6"
        disabled={submitting || !feature.trim()}
      />
    </>
  );
};

const FeatureRequestSheet = (props: FeatureSheetProps) => {
  const snapPoints = useMemo(() => ["40%", "80%"], []);

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={props.featureSheetRef}
        enablePanDownToClose
        enableDynamicSizing={false}
        snapPoints={snapPoints}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            onPress={() => props.featureSheetRef?.current?.close()}
            disappearsOnIndex={-1}
          />
        )}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        index={0}
      >
        <BottomSheetView className="flex-1 px-4 pb-6">
          {SheetContent(props)}
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default FeatureRequestSheet;
