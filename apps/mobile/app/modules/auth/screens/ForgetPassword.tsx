import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import Header from "@/app/components/Header";
import Input from "@/app/components/Input";
import LoadingModal from "@/app/components/LoadingModal";
import PrimaryButton from "@/app/components/PrimaryButton";
import useApis from "../hooks/useApis";

const ForgetPassword: React.FC = () => {
  const navigation = useNavigation();
  const { control, handleSubmit, watch, formState } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPasswordMutation } = useApis();

  const onReset = async (data: any) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: () => {
        navigation.navigate("Otp", { email: data?.email });
      },
    });
  };

  return (
    <View className="flex-1 bg-background">
      <Header title="Forget Password" />

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-base text-gray-600 text-center mb-8 font-nunito-medium">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </Text>

        <Text className="text-base font-nunito-medium text-gray-700 mb-2">
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
              className="mb-4"
            />
          )}
          name="email"
        />
        {formState.errors.email && (
          <Text className="text-error text-sm mb-4 font-nunito">
            {formState.errors.email.message}
          </Text>
        )}

        <PrimaryButton
          disabled={!watch("email")}
          title="Continue"
          onPress={handleSubmit(onReset)}
          className="mb-6 mt-4"
        />

        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600 text-base font-nunito-medium">
            Remember your password?
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
      <LoadingModal isVisible={forgotPasswordMutation.isPending} />
    </View>
  );
};

export default ForgetPassword;
