import PrimaryButton from "@/app/components/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface Testimonial {
  id: number;
  name: string;
  text: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Alex M.",
    text: "The active recall features helped me ace my finals! 🎓",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah K.",
    text: "Love generating quizzes from my notes. Saved me hours of study time.",
    rating: 5,
  },
  {
    id: 3,
    name: "James L.",
    text: "Best flashcard app I've used. The AI is surprisingly accurate.",
    rating: 5,
  },
];

interface ReviewRequestScreenProps {
  onReview: () => Promise<void>;
  onComplete: () => void;
}

const ReviewRequestScreen: React.FC<ReviewRequestScreenProps> = ({
  onReview,
  onComplete,
}) => {
  const [showContinueButton, setShowContinueButton] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      onReview()
    }, 300);

    const timer2 = setTimeout(() => {
      setShowContinueButton(true);
    }, 2000);

    return () => {clearTimeout(timer); clearTimeout(timer2);};
  }, []);

  return (
    <View className="flex-1 px-6 justify-center">
      <View className="flex-1 justify-center space-y-6">
        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          className="items-center mb-8"
        >
          <Text className="text-3xl font-bold text-foreground text-center mb-2">
            Join <Text className="text-primary font-bold">10,000+</Text> Students
          </Text>
          <Text className="text-muted-foreground text-center text-lg">
            Master your <Text className="text-primary font-bold">exams</Text> with active recall
          </Text>
        </Animated.View>

        {testimonials.map((testimonial, index) => (
          <Animated.View
            key={testimonial.id}
            entering={FadeInDown.delay(200 + index * 100).springify()}
            className="bg-card p-4 rounded-2xl border border-border shadow-sm my-3"
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="font-semibold text-textPrimary/90 text-lg">
                {testimonial.name}
              </Text>
              <View className="flex-row">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Ionicons key={i} name="star" size={16} color="#FFD700" />
                ))}
              </View>
            </View>
            <Text className="text-textPrimary/70 leading-5">
              "{testimonial.text}"
            </Text>
          </Animated.View>
        ))}
      </View>
      {showContinueButton && (
      <Animated.View 
        entering={FadeInDown.delay(600).springify()}
        className={`mb-8`}
      >
        <PrimaryButton
          title="Continue"
          onPress={onComplete}
        />
      </Animated.View>
      )}
    </View>
  );
};

export default ReviewRequestScreen;
