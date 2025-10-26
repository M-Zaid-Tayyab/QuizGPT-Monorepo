import { client } from "@/app/services";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

const useApis = () => {
  const registerMutation = useMutation({
    mutationFn: (data: any) => {
      return client.post("auth/register", data);
    },
    onError(error: any) {
      if (error?.response?.data?.message !== "UUID already registered") {
        Toast.show({
          text1: error?.response?.data?.message,
          type: "error",
        });
      }
    },
  });

  const socialLoginMutation = useMutation({
    mutationFn: (data: any) => {
      return client.post("auth/social-login", data);
    },
    onError(error: any) {
      Toast.show({
        text1: error?.response?.data?.message || "Social login failed",
        type: "error",
      });
    },
  });

  const updateSubscriptionStatusMutation = useMutation({
    mutationFn: (isProUser: boolean) => {
      return client.put("auth/user", { isProUser });
    },
    onError(error: any) {
      console.error("Failed to update subscription status:", error);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (userData: any) => {
      return client.put("auth/user", userData);
    },
    onError(error: any) {
      Toast.show({
        text1: error?.response?.data?.message || "Failed to update user",
        type: "error",
      });
    },
  });

  return {
    registerMutation,
    socialLoginMutation,
    updateSubscriptionStatusMutation,
    updateUserMutation,
  };
};

export default useApis;
