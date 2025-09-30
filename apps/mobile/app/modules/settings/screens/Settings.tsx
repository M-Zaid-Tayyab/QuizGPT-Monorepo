import { mmkv } from "@/app/storage/mmkv";
import { useUserStore } from "../../auth/store/userStore";

import colors from "@/app/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SubscriptionStatus from "../../../components/SubscriptionStatus";
import FeatureRequestSheet from "../components/FeatureRequestSheet";
import ProQuizGpt from "../components/ProQuizGpt";

const Settings: React.FC = () => {
  const navigation = useNavigation();
  const { logout, isProUser } = useUserStore();
  const featureSheetRef = React.useRef<BottomSheetModal | null>(null);

  const handleLogout = () => {
    mmkv.clearAll();
    logout();
    (navigation as any).reset({
      index: 0,
      routes: [{ name: "Auth" }],
    });
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL(
      "https://www.privacypolicies.com/live/607f4937-7097-4d77-a64f-aff63835e64c"
    );
  };

  const handleTermsOfService = () => {
    Linking.openURL(
      "https://www.termsfeed.com/live/4e2d37fb-b4be-4005-bad8-009eb45209c6"
    );
  };

  const onInstagramPress = () => {
    Linking.openURL(
      "https://www.instagram.com/quizgpt_app?igsh=OWVvNGR2Y2ZlbjV2"
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="pt-safe pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 mt-6 mb-5">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Legal & Privacy
          </Text>

          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center p-3 border-b border-gray-50"
              onPress={handlePrivacyPolicy}
            >
              <View className="w-10 h-10 bg-darkPurple/10 rounded-xl items-center justify-center mr-4">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={colors.darkPurple}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-nunito-bold text-base">
                  Privacy Policy
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  How we protect your data
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-3"
              onPress={handleTermsOfService}
            >
              <View className="w-10 h-10 bg-success/10 rounded-xl items-center justify-center mr-4">
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={colors.success}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-nunito-bold text-base">
                  Terms of Service
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Our terms and conditions
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 mb-5">
          <Text className="text-lg font-nunito-bold text-gray-900 mb-4">
            Premium
          </Text>
          <ProQuizGpt />
        </View>

        {isProUser && (
          <View className="px-4 mb-5">
            <Text className="text-lg font-nunito-bold text-gray-900 mb-4">
              Subscription
            </Text>
            <SubscriptionStatus showManageButton={true} />
          </View>
        )}

        <View className="px-4 mb-5">
          <Text className="text-lg font-nunito-bold text-gray-900 mb-4">
            Support
          </Text>
          <TouchableOpacity
            className="flex-row items-center p-3 bg-white rounded-2xl"
            onPress={onInstagramPress}
            activeOpacity={0.8}
          >
            <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center mr-4">
              <Ionicons
                name="logo-instagram"
                size={20}
                color={colors.primary}
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-nunito-bold text-base">
                Get Help & Share Feedback
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                Reach out on Instagram for support, feature requests, or to
                report issues
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View className="px-4 pb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            App Information
          </Text>

          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <View className="flex-row items-center p-3 border-b border-gray-50">
              <View className="w-10 h-10 bg-darkPurple/10 rounded-xl items-center justify-center mr-4">
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={colors.darkPurple}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-nunito-bold text-base">
                  App Version
                </Text>
                <Text className="text-gray-500 text-sm mt-1">1.0.0</Text>
              </View>
            </View>

            <View className="flex-row items-center p-3">
              <View className="w-10 h-10 bg-warning/10 rounded-xl items-center justify-center mr-4">
                <Ionicons
                  name="build-outline"
                  size={20}
                  color={colors.warning}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-nunito-bold text-base">
                  Build Number
                </Text>
                <Text className="text-gray-500 text-sm mt-1">30</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-4">
          <TouchableOpacity
            className="flex-row items-center justify-center p-5 bg-red/10 rounded-2xl border border-red/20"
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons
              name="log-out-outline"
              size={24}
              color={colors.red}
              style={{ marginRight: 12 }}
            />
            <Text className="text-red font-nunito-bold text-base">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <FeatureRequestSheet featureSheetRef={featureSheetRef} />
    </View>
  );
};

export default Settings;
