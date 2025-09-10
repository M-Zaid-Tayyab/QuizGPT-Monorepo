export type LoginData = {
  email: string;
  password: string;
};
export type RegisterData = {
  email: string;
  password: string;
};
export type VerifyOTPData = {
  email: string;
  otp: string;
};
export type ResendVerificationEmailData = {
  email: string;
};
export type ForgotPasswordData = {
  email: string;
};
export type ResetPasswordData = {
  email: string;
  newPassword: string;
  confirmPassword: string;
};
