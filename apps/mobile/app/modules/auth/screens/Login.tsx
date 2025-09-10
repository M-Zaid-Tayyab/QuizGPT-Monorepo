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
import { icn } from "@/assets/icn";
import useApis from "../hooks/useApis";
import { useUserStore } from "../store/userStore";
import { LoginData } from "../types";

const Login: React.FC = () => {
  const navigation = useNavigation();
  const { control, handleSubmit, watch, formState } = useForm();
  const { loginMutation } = useApis();
  const { setUser } = useUserStore();

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data, {
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
      <Header title="Login" showBackButton={false} />

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
          <Text className="text-error text-sm font-nunito">
            {formState.errors.email.message}
          </Text>
        )}

        <Text className="text-base font-nunito-medium text-gray-700 mt-4 mb-2">
          Password
        </Text>
        <Controller
          control={control}
          rules={{
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters long",
            },
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
            {formState.errors.password.message}
          </Text>
        )}

        <TouchableOpacity
          onPress={() => (navigation as any).navigate("ForgetPassword")}
          className="self-end mb-6"
        >
          <Text className="text-primary font-nunito-medium text-base">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <PrimaryButton
          disabled={!watch("email") || !watch("password")}
          title="Sign In"
          onPress={handleSubmit(onSubmit)}
          className="mb-6"
        />

        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600 text-base font-nunito-medium">
            New user?
          </Text>
          <TouchableOpacity
            onPress={() => (navigation as any).navigate("Signup")}
            className="flex-row justify-center items-center"
          >
            <Text className="text-primary text-base font-nunito-bold ml-1">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      <LoadingModal isVisible={loginMutation.isPending} />
    </View>
  );
};

export default Login;
