import Header from "@/app/components/Header";
import LoadingModal from "@/app/components/LoadingModal";
import PrimaryButton from "@/app/components/PrimaryButton";
import colors from "@/app/constants/colors";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import OTPTextInput from "react-native-otp-textinput";
import useApis from "../hooks/useApis";

const OTP: React.FC = ({ route }: any) => {
  const navigation = useNavigation();
  const [otpInput, setOtpInput] = useState("");
  const email = route?.params?.email;
  const { verifyEmailMutation } = useApis();

  const handleVerifyOTP = async () => {
    verifyEmailMutation.mutate(
      { email: email, otp: otpInput },
      {
        onSuccess: () => {
          navigation.navigate("ResetPassword", { email: email });
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-background">
      <Header title="OTP Verification" />

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-base text-gray-600 text-center mb-8 font-nunito-medium">
          We&apos;ve sent a verification code to your email. Please enter the
          4-digit code below.
        </Text>

        <View className="mb-8">
          <OTPTextInput
            handleTextChange={(text) => setOtpInput(text)}
            inputCount={4}
            keyboardType="numeric"
            tintColor={colors.primary}
            offTintColor="#D1D5DB"
            textInputStyle={{
              borderWidth: 1,
              borderColor: "#D1D5DB",
              borderRadius: 8,
              width: 60,
              height: 60,
              fontSize: 20,
              textAlign: "center",
            }}
            containerStyle={{
              gap: 12,
            }}
          />
        </View>

        <PrimaryButton
          disabled={otpInput.length !== 4}
          title="Verify"
          onPress={handleVerifyOTP}
          className="mb-6"
        />
      </KeyboardAwareScrollView>

      <LoadingModal isVisible={verifyEmailMutation.isPending} />
    </View>
  );
};

export default OTP;
