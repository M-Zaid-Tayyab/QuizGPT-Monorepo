import {
  BottomSheetBackdrop,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetView,
  BottomSheetModal as GorhomBottomSheetModal,
  type BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo } from "react";
import { widthPercentageToDP } from "react-native-responsive-screen";
import colors from "../constants/colors";

type Props = {
  children: React.ReactNode;
  title?: string;
  snapPoints?: (string | number)[];
  enablePanDownToClose?: boolean;
  backdropPressBehavior?: "close" | "collapse" | "none";
  onChange?: BottomSheetModalProps["onChange"];
  showHandle?: boolean;
  sheetRef: React.RefObject<GorhomBottomSheetModal | null>;
  onDismiss?: () => void;
  scrollView?: boolean;
  maxDynamicContentSize?: number;
  enableDynamicSizing?: boolean;
  enableContentPanningGesture?: boolean;
  enableHandlePanningGesture?: boolean;
};

const BottomSheetModal: React.FC<Props> = ({
  children,
  snapPoints,
  enablePanDownToClose = true,
  backdropPressBehavior = "close",
  onChange,
  showHandle = true,
  sheetRef,
  onDismiss,
  scrollView = false,
  maxDynamicContentSize,
  enableDynamicSizing = true,
  enableContentPanningGesture = true,
  enableHandlePanningGesture = true,
}) => {
  const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

  const renderBackdrop = useCallback(
    (backdropProps: any) => (
      <BottomSheetBackdrop
        {...backdropProps}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
        pressBehavior={backdropPressBehavior}
      />
    ),
    [backdropPressBehavior]
  );

  return (
    <BottomSheetModalProvider>
      <GorhomBottomSheetModal
        ref={sheetRef}
        snapPoints={memoizedSnapPoints}
        enablePanDownToClose={enablePanDownToClose}
        enableContentPanningGesture={enableContentPanningGesture}
        enableHandlePanningGesture={enableHandlePanningGesture}
        onChange={onChange}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={enableDynamicSizing}
        maxDynamicContentSize={maxDynamicContentSize}
        onDismiss={onDismiss}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        handleIndicatorStyle={showHandle ? undefined : { opacity: 0 }}
        backgroundStyle={{
          backgroundColor: colors.white,
          borderTopLeftRadius: widthPercentageToDP(6),
          borderTopRightRadius: widthPercentageToDP(6),
        }}
      >
        {scrollView ? (
          <BottomSheetScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
            alwaysBounceVertical={false}
            className={"flex-1"}
          >
            {children}
          </BottomSheetScrollView>
        ) : (
          <BottomSheetView className={"flex-1"}>{children}</BottomSheetView>
        )}
      </GorhomBottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default BottomSheetModal;
