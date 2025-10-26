import colors from "@/app/constants/colors";
import { icn } from "@/assets/icn";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { widthPercentageToDP } from "react-native-responsive-screen";

import { useUserStore } from "@/modules/auth/store/userStore";

import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useNavigation } from "@react-navigation/native";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";

import AnimatedLoadingModal from "@/app/components/AnimatedLoadingModal";
import Toast from "react-native-toast-message";
import { identifyDevice } from "vexo-analytics";
import useApis from "../hooks/useApis";

GoogleSignin.configure({
  webClientId:
    "1060733453787-0j6tb4dlu0d7ebrqlulup7nbup2flg92.apps.googleusercontent.com",
});

interface WelcomeScreenProps {
  animatedStyle: any;
  floatingIconStyle: any;
  onStartOnboarding: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  animatedStyle,
  floatingIconStyle,
  onStartOnboarding,
}) => {
  const navigation = useNavigation();
  const { setUser } = useUserStore();
  const { socialLoginMutation } = useApis();
  const handleSocialLogin = async (socialData: any) => {
    try {
      const payload = {
        ...socialData,
      };

      const response = await socialLoginMutation.mutateAsync(payload);

      identifyDevice(response.data.user._id);
      setUser({
        ...response.data.user,
        token: response.data.token,
      });
      if (!response.data.user.biggestChallenge) {
        onStartOnboarding();
      } else if (response.data.user.isProUser) {
        (navigation as any).reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      } else {
        (navigation as any).reset({
          index: 0,
          routes: [{ name: "Paywall" }],
        });
      }
    } catch (error: any) {
      Toast.show({
        text1: "Login Failed",
        text2: error?.response?.data?.message || "Something went wrong",
        type: "error",
      });
    }
  };

  const onGooglePress = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.data) {
        const googleData = {
          name: userInfo.data.user?.name,
          email: userInfo.data.user?.email,
          socialId: userInfo.data.user?.id,
          socialType: "google",
          idToken: userInfo.data.idToken,
        };

        await handleSocialLogin(googleData);
      }
    } catch (error: any) {
      console.log(error?.code);
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Cancel");
      } else if (error?.code === statusCodes.IN_PROGRESS) {
        console.log("Signin in progress");
      } else if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("PLAY_SERVICES_NOT_AVAILABLE");
      }
    }
  };

  const onApplePress = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        nonce: Crypto.randomUUID(),
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential) {
        const appleData = {
          name:
            credential.fullName?.givenName +
            " " +
            credential.fullName?.familyName,
          email: credential.email,
          socialId: credential.user,
          idToken: credential.identityToken,
          socialType: "apple",
        };

        await handleSocialLogin(appleData);
      }
    } catch (error: any) {
      console.log(error?.code);
    }
  };

  return (
    <Animated.View
      style={animatedStyle}
      className="flex-1 justify-center items-center px-4"
    >
      <Animated.View style={floatingIconStyle} className="mb-12">
        <View className="w-24 h-24 items-center justify-center">
          <Image
            source={icn.logo}
            style={{
              width: widthPercentageToDP(40),
              height: widthPercentageToDP(40),
            }}
            contentFit="contain"
          />
        </View>
      </Animated.View>
      <Text className="text-4xl font-nunito-bold text-textPrimary text-center mb-1 leading-tight">
        Welcome to <Text className="text-primary">QuizGPT</Text>
      </Text>
      <Text className="text-xl font-nunito-semibold text-textSecondary text-center mb-3 leading-tight">
        Better <Text className="text-primary">grades,</Text> faster.
      </Text>
      <View className="w-full absolute bottom-safe">
        <View className="gap-y-4">
          <TouchableOpacity
            style={{
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 3.84,
              elevation: 5,
            }}
            className="bg-white rounded-full py-4 flex-row items-center justify-center border border-borderColor shadow-sm"
            onPress={onGooglePress}
          >
            <Image
              source={icn.google}
              style={{ width: 20, height: 20 }}
              contentFit="contain"
            />
            <Text className="text-lg font-nunito-medium text-textPrimary ml-3">
              Continue with Google
            </Text>
          </TouchableOpacity>

          {Platform.OS === "ios" && (
            <TouchableOpacity
              style={{
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 3.84,
                elevation: 2,
              }}
              className="bg-black rounded-full py-4 flex-row items-center justify-center shadow-md"
              onPress={onApplePress}
            >
              <Ionicons name="logo-apple" size={22} color={colors.white} />
              <Text className="text-lg font-nunito-medium text-white ml-3">
                Continue with Apple
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <AnimatedLoadingModal
        isVisible={socialLoginMutation.isPending}
        messages={["Getting you in", "Please wait"]}
      />
    </Animated.View>
  );
};

export default WelcomeScreen;
