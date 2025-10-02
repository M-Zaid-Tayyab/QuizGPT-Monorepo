import colors from "@/app/constants/colors";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, Easing, FlatList, View } from "react-native";
import FlashcardFlipCard from "./FlashcardFlipCard";

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  difficulty: string;
  category: string;
  tags: string[];
}

interface FlashcardCardFlatListProps {
  flashcards: Flashcard[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onFlip: (index: number) => void;
  isFlipped: boolean;
}

export interface FlashcardCardFlatListRef {
  scrollToNext: () => void;
  scrollToPrevious: () => void;
}

const FlashcardCardFlatList = React.forwardRef<
  FlashcardCardFlatListRef,
  FlashcardCardFlatListProps
>(({ flashcards, currentIndex, onIndexChange, onFlip, isFlipped }, ref) => {
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const { width } = Dimensions.get("window");
  const initialHint = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const lastReportedIndex = useRef(currentIndex);

  // Stable, responsive card dimensions (no animation changes)
  const horizontalPadding = 32; // px-4 on each side in item container
  const cardWidth = Math.max(260, Math.min(width - horizontalPadding, 380));
  const cardHeight = Math.round(cardWidth * 0.75); // 4:3 aspect ratio

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return colors.success;
      case "Medium":
        return colors.warning;
      case "Hard":
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const flipCard = (index: number) => {
    // Step 3: basic press feedback only (no scale animation yet)
    Haptics.selectionAsync();
    onFlip(index);
  };

  useEffect(() => {
    Animated.sequence([
      Animated.timing(initialHint, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(initialHint, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [initialHint]);

  // Animate flip when isFlipped changes
  useEffect(() => {
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [currentIndex, isFlipped, flipAnimation]);

  // Update lastReportedIndex when currentIndex changes from outside (header navigation)
  useEffect(() => {
    lastReportedIndex.current = currentIndex;
  }, [currentIndex]);

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const cardTransformFront = useMemo(
    () => [
      { perspective: 1000 },
      { rotateY: frontInterpolate },
      { scale: pressScale },
    ],
    [frontInterpolate, pressScale]
  );

  const cardTransformBack = useMemo(
    () => [
      { perspective: 1000 },
      { rotateY: backInterpolate },
      { scale: pressScale },
    ],
    [backInterpolate, pressScale]
  );

  // Hint transform only nudges translateY to avoid rotate/scale conflicts
  const hintTranslateTransform = useMemo(
    () => [
      {
        translateY: initialHint.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 4],
        }),
      },
    ],
    [initialHint]
  );

  const renderCard = ({
    item: flashcard,
    index,
  }: {
    item: Flashcard;
    index: number;
  }) => {
    const isCurrentCard = index === currentIndex;
    const isAdjacentCard = Math.abs(index - currentIndex) === 1;
    const isNearViewport = isCurrentCard || isAdjacentCard;

    if (!isNearViewport) {
      // Do not render distant cards to save work
      return (
        <View
          style={{ width, height: cardHeight + 24 }}
          className="justify-center items-center px-4"
        >
          <View
            className="rounded-2xl"
            style={{
              width: cardWidth,
              height: cardHeight,
              backgroundColor: colors.white,
              borderRadius: 20,
              opacity: 0.4,
              transform: [{ scale: 0.96 }, { translateY: 12 }],
              shadowColor: colors.shadow,
              shadowOpacity: 0.1,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          />
        </View>
      );
    }

    return (
      <View
        style={{ width, height: cardHeight + 24 }}
        className="justify-center items-center px-4"
      >
        <FlashcardFlipCard
          flashcard={flashcard}
          // Only the current card reflects flip state; neighbors always show front
          isFlipped={isCurrentCard ? isFlipped : false}
          // Disable flipping on non-current to avoid accidental taps during swipe
          onPress={isCurrentCard ? () => flipCard(index) : () => {}}
          pressScale={pressScale}
          frontTransform={
            isCurrentCard && isFlipped
              ? cardTransformFront
              : [...cardTransformFront, ...hintTranslateTransform]
          }
          backTransform={cardTransformBack}
          hintTransform={hintTranslateTransform}
          getDifficultyColor={getDifficultyColor}
          width={cardWidth}
          height={cardHeight}
        />
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;

      // More robust bounds checking and prevent duplicate updates
      if (
        newIndex !== lastReportedIndex.current &&
        newIndex >= 0 &&
        newIndex < flashcards.length &&
        typeof newIndex === "number" &&
        !isNaN(newIndex)
      ) {
        lastReportedIndex.current = newIndex;
        // Use requestAnimationFrame to ensure it happens after render
        requestAnimationFrame(() => {
          onIndexChange(newIndex);
        });
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80, // Higher threshold for more stable detection
    minimumViewTime: 200, // Longer minimum view time to prevent rapid changes
    waitForInteraction: false, // Don't wait for interaction
  }).current;

  // Handle programmatic navigation with error handling
  const scrollToNext = () => {
    if (currentIndex < flashcards.length - 1) {
      try {
        flatListRef.current?.scrollToIndex({
          index: currentIndex + 1,
          animated: true,
        });
      } catch (error) {
        console.warn("Error scrolling to next card:", error);
        // Fallback: scroll to offset
        flatListRef.current?.scrollToOffset({
          offset: (currentIndex + 1) * width,
          animated: true,
        });
      }
    }
  };

  const scrollToPrevious = () => {
    if (currentIndex > 0) {
      try {
        flatListRef.current?.scrollToIndex({
          index: currentIndex - 1,
          animated: true,
        });
      } catch (error) {
        console.warn("Error scrolling to previous card:", error);
        // Fallback: scroll to offset
        flatListRef.current?.scrollToOffset({
          offset: (currentIndex - 1) * width,
          animated: true,
        });
      }
    }
  };

  // Expose methods to parent via ref
  React.useImperativeHandle(ref, () => ({
    scrollToNext,
    scrollToPrevious,
  }));

  return (
    <View className="flex-1 justify-center">
      <FlatList
        ref={flatListRef}
        data={flashcards}
        renderItem={renderCard}
        keyExtractor={(item) => item._id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialScrollIndex={Math.min(currentIndex, flashcards.length - 1)}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        snapToInterval={width}
        snapToAlignment="center"
        decelerationRate="fast"
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: "center" }}
        removeClippedSubviews={false} // Prevent cards from disappearing
        maxToRenderPerBatch={3} // Render more items for smoother scrolling
        windowSize={5} // Keep more items in memory
        onScrollToIndexFailed={(info) => {
          console.warn("ScrollToIndex failed:", info);
          // Fallback: scroll to offset
          setTimeout(() => {
            flatListRef.current?.scrollToOffset({
              offset: info.index * width,
              animated: true,
            });
          }, 100);
        }}
      />
    </View>
  );
});

FlashcardCardFlatList.displayName = "FlashcardCardFlatList";

export default FlashcardCardFlatList;
