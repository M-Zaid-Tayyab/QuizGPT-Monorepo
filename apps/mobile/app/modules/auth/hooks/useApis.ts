import { client } from "@/app/services";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import {
  ForgotPasswordData,
  LoginData,
  RegisterData,
  ResendVerificationEmailData,
  ResetPasswordData,
  VerifyOTPData,
} from "../types";

const useApis = () => {
  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => {
      return client.post("auth/login", data);
    },
    onError(error: any) {
      Toast.show({
        text1: error?.response?.data?.message,
        type: "error",
      });
    },
  });
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => {
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
  const verifyEmailMutation = useMutation({
    mutationFn: (data: VerifyOTPData) => {
      return client.post("auth/verify-otp", data);
    },
    onError(error: any) {
      Toast.show({
        text1: error?.response?.data?.message,
        type: "error",
      });
    },
  });
  const resendVerificationEmailMutation = useMutation({
    mutationFn: (data: ResendVerificationEmailData) => {
      return client.post("auth/resend-verification-email", data);
    },
    onError(error: any) {
      Toast.show({
        text1: error?.response?.data?.message,
        type: "error",
      });
    },
  });
  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordData) => {
      return client.post("auth/reset-password", data);
    },
    onError(error: any) {
      Toast.show({
        text1: error?.response?.data?.message,
        type: "error",
      });
    },
  });
  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordData) => {
      return client.post("auth/forgot-password", data);
    },
    onError(error: any) {
      Toast.show({
        text1: error?.response?.data?.message,
        type: "error",
      });
    },
  });
  return {
    loginMutation,
    registerMutation,
    verifyEmailMutation,
    resendVerificationEmailMutation,
    resetPasswordMutation,
    forgotPasswordMutation,
  };
};

export default useApis;
