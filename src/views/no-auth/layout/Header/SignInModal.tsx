"use client";

import { useState, useEffect, FormEvent } from "react";
import Button from "@/components/ui/NewButton";
import Image from "next/image";
import http from "@/services/http";
import {
  setStorageItem,
  removeStorageItem,
  getStorageItem,
} from "@/services/storage";
import { LOCAL_KEY } from "@/common/enums";
import { useSetAtom } from "jotai";
import { userAtom } from "@/app/atoms/auth";
import ForgotPasswordModal from "./ForgotPasswordModal";
import ResetPasswordModal from "./ResetPasswordModal";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp?: () => void;
}

const initialValue = {
  email: "",
  password: "",
};

export default function SignInModal({
  isOpen,
  onClose,
  onSwitchToSignUp,
}: Readonly<SignInModalProps>) {
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const API_BASE = process.env.NEXT_PUBLIC_BASE_URI;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);
  const setUser = useSetAtom(userAtom);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (showForgotModal) {
    return (
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        isLoading={forgotLoading}
        onSubmit={async (email: string) => {
          setForgotLoading(true);
          try {
            await http.post("/users/forgot-password", { email });
            alert(
              "If your email exists, a reset link has been sent. Please check your email for the reset link."
            );
            setShowForgotModal(false);
            // Do not open reset modal automatically; user will use the link from their email
          } catch (err) {
            alert("Error sending reset link.");
          } finally {
            setForgotLoading(false);
          }
        }}
      />
    );
  }

  if (showResetModal) {
    return (
      <ResetPasswordModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        isLoading={resetLoading}
        onSubmit={async ({ email, newPassword }) => {
          setResetLoading(true);
          try {
            await http.post("/users/reset-password", {
              email,
              newPassword,
            });
            alert(
              "Password reset successful. You can now sign in with your new password."
            );
            setShowResetModal(false);
          } catch (err) {
            alert("Error resetting password. Please try again.");
          } finally {
            setResetLoading(false);
          }
        }}
        initialEmail={resetEmail}
      />
    );
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert("Please fill in all required fields");
      return;
    }
    setOtpError("");
    try {
      setIsLoading(true);
      const { data } = await http.post("/users/login", formData);
      if (data && data.token) {
        // Always check 2FA status from user profile after login
        let twoFAEnabled = false;
        let userProfile = null;
        try {
          const profileRes = await http.get("/users/user-detail", {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          userProfile = profileRes?.data?.user;
          twoFAEnabled = !!(
            userProfile?.twoFAEnabled || userProfile?.two_fa_enabled
          );
        } catch {
          // fallback: if can't fetch profile, use login response
          twoFAEnabled = !!(
            data.twoFAEnabled ||
            data.two_fa_enabled ||
            data.user?.twoFAEnabled
          );
        }
        if (twoFAEnabled) {
          try {
            await http.post("/users/send-otp-for-2steplogin", {
              email: formData.email,
            });
            setOtpSent(true);
            setOtpError("");
          } catch (err) {
            setOtpError("Failed to send OTP. Please try again.");
            setOtpSent(false);
            return;
          }
          // Store token temporarily for OTP verification
          removeStorageItem(LOCAL_KEY.ACCESS_TOKEN);
          setStorageItem("TEMP_LOGIN_TOKEN", data.token);
          // Also store the token as ACCESS_TOKEN for fallback
          setStorageItem(LOCAL_KEY.ACCESS_TOKEN, data.token);
          return; // Wait for OTP verification before storing token/user
        }
        // If no 2FA, proceed as normal
        // Use userProfile if available, else fallback to login response
        const userData = userProfile
          ? {
              ...userProfile,
              email: userProfile.email,
              id: userProfile.id,
              phone: userProfile.phone,
              firstName: userProfile.firstName,
              lastName: userProfile.lastName,
            }
          : {
              email: data.user_email,
              id: data.user_id,
              phone: data.user_phone,
              firstName: data.user_firstName,
              lastName: data.user_lastName,
            };
        removeStorageItem(LOCAL_KEY.ACCESS_TOKEN);
        setStorageItem(LOCAL_KEY.ACCESS_TOKEN, data.token);
        setStorageItem(LOCAL_KEY.USER, JSON.stringify(userData));
        setUser(userData);
        setFormData(initialValue);
        // Always ensure token is present after login
        if (!getStorageItem(LOCAL_KEY.ACCESS_TOKEN)) {
          setStorageItem(LOCAL_KEY.ACCESS_TOKEN, data.token);
        }
        if (userData?.email) {
          onClose();
        }
      }
    } catch (err) {
      setOtpError("Login failed. Please check your credentials and try again.");
      const code =
        (err && (err as any)?.response?.status) ||
        (err && typeof err === "object" && "statusCode" in err
          ? (err as any).statusCode
          : undefined);
      if (code === 419) {
        // fallback: legacy OTP flow
        try {
          const { data } = await http.post("/users/send-otp-normal", {
            email: formData.email,
          });
          if (data) {
            setOtpSent(true);
            setOtpError("");
          }
        } catch {
          setOtpError("Failed to send OTP. Please try again.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitWithOtp = async (enteredOtp: any) => {
    setOtpError("");
    const email = formData.email;
    const otp = enteredOtp;
    try {
      setIsLoading(true);
      // Use the temp token for OTP verification
      const tempToken = localStorage.getItem("TEMP_LOGIN_TOKEN");
      const { data } = await http.post(
        "/users/verifyotp",
        { email, otp },
        tempToken
          ? { headers: { Authorization: `Bearer ${tempToken}` } }
          : undefined
      );
      // If verified and token present, store token and user, and fetch full profile if needed
      if (data?.verified && data?.token) {
        removeStorageItem(LOCAL_KEY.ACCESS_TOKEN);
        setStorageItem(LOCAL_KEY.ACCESS_TOKEN, data.token);
        // Always ensure token is present after OTP verification
        if (!getStorageItem(LOCAL_KEY.ACCESS_TOKEN)) {
          setStorageItem(LOCAL_KEY.ACCESS_TOKEN, data.token);
        }
        // Fetch the full user profile using the new token
        try {
          const profileRes = await http.get("/users/user-detail", {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          const userObj = profileRes?.data?.user;
          if (userObj) {
            setStorageItem(LOCAL_KEY.USER, JSON.stringify(userObj));
            setUser(userObj);
          } else if (data.user) {
            setStorageItem(LOCAL_KEY.USER, JSON.stringify(data.user));
            setUser(data.user);
          }
        } catch {
          if (data.user) {
            setStorageItem(LOCAL_KEY.USER, JSON.stringify(data.user));
            setUser(data.user);
          }
        }
        removeStorageItem("TEMP_LOGIN_TOKEN");
        setFormData(initialValue);
        onClose();
      } else {
        setOtpError(data?.message || "Invalid OTP. Please try again.");
      }
    } catch (err: any) {
      setOtpError(
        err?.response?.data?.message ||
          "OTP verification failed. Please try again."
      );
      console.error("verify error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const currentUrl = window.location.href;
    localStorage.setItem("returnTo", currentUrl);
    window.location.href = `${API_BASE}/auth/google`;
  };

  const email = formData?.email;
  const handleEmailBlur = async () => {
    if (!formData.email || !formData.email.includes("@")) {
      console.warn("Invalid email");
      return;
    }
    try {
      const { data } = await http.post("/users/check-user", { email });
      console.log("email data", data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message?.[0] ||
        "Something went wrong, please try again";
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: message,
        confirmButtonColor: "#FF6B6B",
      });
    }
  };

  return (
    <div
      className="fixed inset-0  bg-opacity-40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[700px] bg-white rounded-lg overflow-hidden shadow-2xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-4 right-4 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="#000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="flex h-full flex-col lg:flex-row">
          {/* Left Side - Image (hidden on mobile) */}
          <div className="hidden lg:flex flex-[1.2] relative bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
            <Image
              src="/assets/banners/auth-banner.svg"
              alt="Travel Adventure"
              fill
              className="object-cover"
            />
          </div>
          {/* Right Side - Form */}
          <div className="flex-[0.8] bg-[#F7F8FA] flex flex-col justify-center items-center p-6">
            <div className="w-full px-3">
              {/* Brand Name */}
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold  text-[#FF6B6B] font-poppins">
                  Travulu
                </h1>
              </div>
              {/* Form Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray mb-2 font-raleway">
                  Sign in to your account
                </h2>
                <p className="text-[#374151]  font-nunito">
                  Sign In to start planning your next adventure and receive
                  exclusive travel offers.
                </p>
              </div>
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 font-nunito">
                {/* Email Address */}
                <div>
                  <label className="block text-black font-bold text-base mb-2 capitalize font-nunito">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={handleEmailBlur}
                    placeholder="Email"
                    className="w-full h-[50px] px-3 bg-white border border-[#b3b3b3] rounded-lg  text-black text-lg focus:outline-none focus:ring-2 focus:ring-[#014569] focus:border-[#014569] font-nunito"
                  />
                </div>
                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-black font-bold text-base capitalize font-nunito">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-sm text-[#f25c54] hover:underline font-nunito cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Password"
                      className="w-full h-[50px] px-3 pr-12 border border-[#b3b3b3] rounded-lg bg-white text-black text-lg focus:outline-none focus:ring-2 focus:ring-[#014569] focus:border-[#014569] font-nunito"
                    />
                    <button
                      type="button"
                      tabIndex={0}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPassword((v) => !v);
                      }}
                      className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        // Open eye icon
                        <Eye size={20} />
                      ) : (
                        // Closed eye icon
                        <EyeOff size={20} />
                      )}
                    </button>
                  </div>
                </div>
                {/* Submit Button */}
                <Button
                  isLoading={isLoading}
                  type="submit"
                  variant="solid"
                  color="secondary"
                  className="w-full"
                >
                  Sign in
                </Button>
              </form>
              {otpSent && (
                <>
                  <div className="mt-6">
                    <label className="block text-black font-bold text-base mb-2 capitalize font-nunito">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="w-full h-[60px] px-3 border border-[#b3b3b3] rounded-lg bg-white text-black text-lg focus:outline-none focus:ring-2 focus:ring-[#014569] focus:border-[#014569] font-nunito"
                      disabled={isLoading}
                    />
                    {otpError && (
                      <div className="text-red-500 text-sm mt-2">
                        {otpError}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleSubmitWithOtp(otp)}
                    variant="solid"
                    color="secondary"
                    className="w-full mt-3"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify & Submit"}
                  </Button>
                </>
              )}
              {/* Toggle to Sign Up */}
              <div className="text-center mt-6">
                <span className="text-black font-nunito">
                  Don&apos;t have an account?
                </span>
                <button
                  onClick={onSwitchToSignUp}
                  className="text-[#f25c54] cursor-pointer font-bold hover:underline ml-1 font-nunito"
                >
                  Sign Up
                </button>
              </div>
              {/* Social Login */}
              <div className="flex gap-5 mt-8">
                {/* Google */}
                <button
                  onClick={handleGoogleLogin}
                  type="button"
                  className="mx-auto flex flex-row items-center justify-center gap-2 h-10 px-8 border border-[#b3b3b3] rounded-lg bg-white text-black text-lg focus:outline-none focus:ring-2 focus:ring-[#014569] focus:border-[#014569] cursor-pointer"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 25 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_280_8104)">
                      <path
                        d="M8.85909 0.789433C6.46112 1.62131 4.39311 3.20024 2.95882 5.29431C1.52454 7.38838 0.799573 9.8872 0.890418 12.4237C0.981264 14.9603 1.88313 17.4008 3.46355 19.3869C5.04396 21.373 7.21962 22.8 9.67096 23.4582C11.6583 23.971 13.7405 23.9935 15.7385 23.5238C17.5484 23.1173 19.2218 22.2476 20.5947 21.0001C22.0236 19.662 23.0608 17.9597 23.5947 16.0763C24.1751 14.0282 24.2783 11.8743 23.8966 9.78006H12.7366V14.4094H19.1997C19.0705 15.1478 18.7937 15.8525 18.3859 16.4814C17.978 17.1102 17.4474 17.6504 16.826 18.0694C16.0367 18.5915 15.1471 18.9428 14.2141 19.1007C13.2784 19.2747 12.3186 19.2747 11.3828 19.1007C10.4344 18.9046 9.53727 18.5132 8.74846 17.9513C7.48124 17.0543 6.52973 15.7799 6.02971 14.3101C5.52124 12.8127 5.52124 11.1893 6.02971 9.69193C6.38564 8.64234 6.97403 7.68669 7.75096 6.89631C8.64007 5.97521 9.76571 5.3168 11.0044 4.99333C12.243 4.66985 13.5469 4.6938 14.7728 5.06256C15.7305 5.35654 16.6063 5.87019 17.3303 6.56256C18.0591 5.83756 18.7866 5.11068 19.5128 4.38193C19.8878 3.99006 20.2966 3.61693 20.666 3.21568C19.5608 2.1872 18.2635 1.38691 16.8485 0.860683C14.2717 -0.0749616 11.4522 -0.100106 8.85909 0.789433Z"
                        fill="white"
                      />
                      <path
                        d="M8.85875 0.789367C11.4516 -0.100776 14.2711 -0.0762934 16.8481 0.858742C18.2634 1.38855 19.5601 2.19269 20.6637 3.22499C20.2887 3.62624 19.8931 4.00124 19.5106 4.39124C18.7831 5.11749 18.0562 5.84124 17.33 6.56249C16.606 5.87012 15.7302 5.35648 14.7725 5.06249C13.547 4.69244 12.2432 4.66711 11.0042 4.98926C9.76516 5.31141 8.63883 5.96861 7.74875 6.88874C6.97181 7.67912 6.38342 8.63477 6.0275 9.68437L2.14062 6.67499C3.53189 3.91604 5.94078 1.80566 8.85875 0.789367Z"
                        fill="#E33629"
                      />
                      <path
                        d="M1.1114 9.6563C1.32032 8.62091 1.66716 7.61822 2.14265 6.67505L6.02953 9.69192C5.52105 11.1893 5.52105 12.8127 6.02953 14.31C4.73453 15.31 3.4389 16.315 2.14265 17.325C0.952308 14.9556 0.589275 12.256 1.1114 9.6563Z"
                        fill="#F8BD00"
                      />
                      <path
                        d="M12.7391 9.77808H23.8991C24.2809 11.8723 24.1776 14.0262 23.5972 16.0743C23.0633 17.9577 22.0261 19.66 20.5972 20.9981C19.3429 20.0193 18.0829 19.0481 16.8285 18.0693C17.4504 17.6498 17.9812 17.1091 18.3891 16.4796C18.797 15.85 19.0735 15.1446 19.2022 14.4056H12.7391C12.7372 12.8643 12.7391 11.3212 12.7391 9.77808Z"
                        fill="#587DBD"
                      />
                      <path
                        d="M2.14062 17.3251C3.43687 16.3251 4.7325 15.3201 6.0275 14.3101C6.52851 15.7804 7.48138 17.0549 8.75 17.9513C9.54127 18.5106 10.4404 18.8988 11.39 19.0913C12.3257 19.2653 13.2855 19.2653 14.2213 19.0913C15.1542 18.9334 16.0439 18.5821 16.8331 18.0601C18.0875 19.0388 19.3475 20.0101 20.6019 20.9888C19.2292 22.237 17.5558 23.1073 15.7456 23.5144C13.7476 23.9841 11.6655 23.9616 9.67813 23.4488C8.10632 23.0291 6.63814 22.2893 5.36563 21.2757C4.01874 20.2063 2.91867 18.8588 2.14062 17.3251Z"
                        fill="#319F43"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_280_8104">
                        <rect
                          width="24"
                          height="24"
                          fill="white"
                          transform="translate(0.5)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                  <span className="text-[#014569] font-nunito">
                    Continue With Google
                  </span>
                </button>
                {/* Facebook */}
                {/* <button
                  type="button"
                  className="flex-1 flex flex-row items-center justify-center gap-2 h-10 px-2 border-[1.5px] border-social-blue/20 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_280_8112)">
                      <path
                        d="M24 12C24 5.37262 18.6274 0 12 0C5.37262 0 0 5.37262 0 12C0 17.9895 4.38825 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9705 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.3399 7.875 13.875 8.80003 13.875 9.74906V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6117 22.954 24 17.9896 24 12Z"
                        fill="#1877F2"
                      />
                      <path
                        d="M16.6711 15.4688L17.2031 12H13.875V9.74906C13.875 8.79994 14.3399 7.875 15.8306 7.875H17.3438V4.92188C17.3438 4.92188 15.9705 4.6875 14.6575 4.6875C11.9166 4.6875 10.125 6.34875 10.125 9.35625V12H7.07812V15.4688H10.125V23.8542C10.7453 23.9514 11.3722 24.0001 12 24C12.6278 24.0001 13.2547 23.9514 13.875 23.8542V15.4688H16.6711Z"
                        fill="white"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_280_8112">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  <span className="text-social-blue font-lato text-[13px]">
                    Continue With Facebook
                  </span>
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
