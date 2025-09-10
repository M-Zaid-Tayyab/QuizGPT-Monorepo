import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import Header from "@/app/components/Header";
import Input from "@/app/components/Input";
import LoadingModal from "@/app/components/LoadingModal";
import PrimaryButton from "@/app/components/PrimaryButton";
import { mmkv } from "@/app/storage/mmkv";
import { icn } from "@/assets/icn";
import useApis from "../hooks/useApis";
import { useUserStore } from "../store/userStore";

const Signup: React.FC = () => {
  const navigation = useNavigation();
  const { control, handleSubmit, watch, formState } = useForm();
  const { registerMutation } = useApis();
  const { setUser } = useUserStore();
  const onboardingAnswers = JSON.parse(
    mmkv.getString("onboardingAnswers") || "{}"
  );

  const onSubmit = (data: any) => {
    mmkv.delete("onboardingAnswers");
    const payload = {
      ...data,
      age: onboardingAnswers["1"],
      gender: onboardingAnswers["2"],
      grade: onboardingAnswers["3"],
      difficulty: onboardingAnswers["4"],
    };
    registerMutation.mutate(payload, {
      onSuccess: (response) => {
        const user = {
          ...response.data.user,
          token: response.data.token,
        };
        setUser(user);
        (navigation as any).navigate("Main");
      },
    });
  };

  return (
    <View className="flex-1 bg-background">
      <Header title="Sign Up" showBackButton={false} />

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={icn.logo}
          className="w-32 h-32 self-center mb-8"
          contentFit="contain"
        />

        <Text className="text-base font-nunito-medium text-gray-700 mb-2">
          First Name
        </Text>
        <Controller
          control={control}
          rules={{
            required: "First name is required",
          }}
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Enter your first name"
              numberOfCharacter={20}
              value={value}
              onChangeText={onChange}
              error={!!formState.errors.name}
            />
          )}
          name="name"
        />
        {formState.errors.name && (
          <Text className="text-error text-sm mb-4 font-nunito">
            {formState?.errors?.name?.message}
          </Text>
        )}

        <Text className="text-base font-nunito-medium text-gray-700 mt-4 mb-2">
          Email Address
        </Text>
        <Controller
          control={control}
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email format",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Enter your email"
              numberOfCharacter={20}
              value={value}
              onChangeText={onChange}
              error={!!formState.errors.email}
            />
          )}
          name="email"
        />
        {formState.errors.email && (
          <Text className="text-error text-sm mb-4 font-nunito">
            {formState?.errors?.email?.message}
          </Text>
        )}

        <Text className="text-base font-nunito-medium text-gray-700 mt-4 mb-2">
          Password
        </Text>
        <Controller
          control={control}
          rules={{
            required: "Password is required",
          }}
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Enter your password"
              numberOfCharacter={20}
              value={value}
              onChangeText={onChange}
              error={!!formState.errors.password}
              type="password"
            />
          )}
          name="password"
        />
        {formState.errors.password && (
          <Text className="text-error text-sm mb-4 font-nunito">
            {formState?.errors?.password?.message}
          </Text>
        )}

        <Text className="text-base font-nunito-medium text-gray-700 mt-4 mb-2">
          Confirm Password
        </Text>
        <Controller
          control={control}
          rules={{
            required: "Please confirm your password",
          }}
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Confirm your password"
              numberOfCharacter={20}
              value={value}
              onChangeText={onChange}
              error={!!formState.errors.confirmPassword}
              type="password"
            />
          )}
          name="confirmPassword"
        />
        {formState.errors.confirmPassword && (
          <Text className="text-error text-sm mb-4 font-nunito">
            {formState?.errors?.confirmPassword?.message}
          </Text>
        )}

        <PrimaryButton
          disabled={
            !watch("email") ||
            !watch("password") ||
            !watch("confirmPassword") ||
            !watch("name")
          }
          title="Sign Up"
          onPress={handleSubmit(onSubmit)}
          className="mb-6 mt-14"
        />

        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600 text-base font-nunito-medium">
            Already have an account?
          </Text>
          <TouchableOpacity
            onPress={() => navigation.replace("Login")}
            className="flex-row justify-center items-center"
          >
            <Text className="text-primary text-base font-nunito-bold ml-1">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      <LoadingModal isVisible={registerMutation.isPending} />
    </View>
  );
};

export default Signup;
