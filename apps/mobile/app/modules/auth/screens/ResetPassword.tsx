import Header from "@/app/components/Header";
import Input from "@/app/components/Input";
import LoadingModal from "@/app/components/LoadingModal";
import PrimaryButton from "@/app/components/PrimaryButton";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useApis from "../hooks/useApis";

const ResetPassword: React.FC = ({ route }: any) => {
  const navigation = useNavigation();
  const email = route?.params?.email;
  const { resetPasswordMutation } = useApis();
  const { control, handleSubmit, watch, formState } = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  return (
    <View className="flex-1 bg-background">
      <Header title="Reset Password" />

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Text className="text-base font-nunito-medium text-gray-600 text-center mb-8">
          Enter your new password below. Make sure it&apos;s at least 8
          characters long.
        </Text>

        <Text className="text-base font-nunito-medium text-gray-700 mb-2">
          New Password
        </Text>
        <Controller
          control={control}
          rules={{
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Enter new password"
              numberOfCharacter={20}
              value={value}
              onChangeText={onChange}
              error={!!formState.errors.newPassword}
              type="password"
            />
          )}
          name="newPassword"
        />
        {formState.errors.newPassword && (
          <Text className="text-error text-sm mb-4 font-nunito">
            {formState.errors.newPassword.message}
          </Text>
        )}

        <Text className="text-base font-nunito-medium text-gray-700 mt-4 mb-2">
          Confirm Password
        </Text>
        <Controller
          control={control}
          rules={{
            required: "Please confirm your password",
            validate: (value) =>
              value === watch("newPassword") || "Passwords do not match",
          }}
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Confirm new password"
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
            {formState.errors.confirmPassword.message}
          </Text>
        )}

        <PrimaryButton
          disabled={!watch("newPassword") || !watch("confirmPassword")}
          title={"Reset Password"}
          onPress={handleSubmit((data) => {
            resetPasswordMutation.mutate(
              {
                email: email,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
              },
              {
                onSuccess: () => {
                  navigation.navigate("Login");
                },
              }
            );
          })}
          className="mb-6 mt-14"
        />
      </KeyboardAwareScrollView>
      <LoadingModal isVisible={resetPasswordMutation.isPending} />
    </View>
  );
};

export default ResetPassword;
