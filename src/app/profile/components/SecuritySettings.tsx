"use client";
import React from "react";
import Link from "next/link";
import Button from "@/components/ui/NewButton";
import { Eye, EyeOff } from "lucide-react";
import http from "@/services/http";

interface SecuritySettingsProps {
  user: any;
}

export default function SecuritySettings({ user }: SecuritySettingsProps) {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [ newPassword, setNewPassword] = React.useState("");
  const [recoveryEmail, setRecoveryEmail] = React.useState("");
  const [passwordLoading, setPasswordLoading] = React.useState(false);
  const [passwordMessage, setPasswordMessage] = React.useState<string | null>(
    null
  );
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  const [otpLoading, setOtpLoading] = React.useState(false);
  const [otpVerified, setOtpVerified] = React.useState(false);
  const [otpMessage, setOtpMessage] = React.useState<string | null>(null);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendOtp = async () => {
    // Validate form fields before sending OTP
    if (!currentPassword.trim()) {
      setOtpMessage("Please enter your current password.");
      return;
    }
    if (!newPassword.trim()) {
      setOtpMessage("Please enter your new password.");
      return;
    }
    if (newPassword.trim().length < 6) {
      setOtpMessage("New password must be at least 6 characters.");
      return;
    }

    setOtpLoading(true);
    setOtpMessage(null);
    try {
      await http.post("/users/send-otp", { email: user.email });
      setOtpSent(true);
      setOtpMessage("OTP sent to your email.");
    } catch (err: any) {
      setOtpMessage(err?.response?.data?.message || "Failed to send OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setOtpMessage("Please enter the OTP.");
      return;
    }

    setOtpLoading(true);
    setOtpMessage(null);
    try {
      await http.post("/users/verify-otp", { email: user.email, otp });
      setOtpVerified(true);
      setOtpMessage(
        "OTP verified successfully. You can now save your changes."
      );
    } catch (err: any) {
      setOtpMessage(err?.response?.data?.message || "Invalid OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!user?.email || !validateEmail(user.email)) {
      setPasswordMessage("User email is missing or invalid.");
      return;
    }
    if (!otpVerified) {
      setPasswordMessage("Please verify OTP before updating password.");
      return;
    }
    const trimmedCurrentPassword = String(currentPassword || "").trim();
    const trimmedNewPassword = String(newPassword || "").trim();
    if (trimmedCurrentPassword.length < 6) {
      setPasswordMessage(
        "Password must be a string and at least 6 characters."
      );
      return;
    }
    if (trimmedNewPassword.length < 6) {
      setPasswordMessage(
        "New password must be a string and at least 6 characters."
      );
      return;
    }
    setPasswordLoading(true);
    try {
      // Get token from localStorage (same as login)
      const token = localStorage.getItem("access-token");
      const res = await http.post(
        "/users/update-Password",
        {
          email: user.email,
          password: trimmedCurrentPassword,
          newpassword: trimmedNewPassword,
        },
        token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : undefined
      );

      // Check for successful response - handle different response formats
      if (res && (res.data || res.status === 200 || res.status === 201)) {
        // Check if the response indicates success
        const isSuccess =
          res.data?.success === true ||
          res.data?.message?.tLoowerCase().includes("success") ||
          res.data?.status === "success" ||
          res.status === 200 ||
          res.status === 201 ||
          !res.data?.error;

        if (isSuccess) {
          setPasswordMessage("Password updated successfully!");

          // Clear all form data
          setCurrentPassword("");
          setNewPassword("");
          setRecoveryEmail("");
          setOtp("");
          setOtpSent(false);
          setOtpVerified(false);

          // Refresh the page after a short delay to show fresh state
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setPasswordMessage(
            res.data?.message || "Password update completed but status unclear."
          );
        }
      } else {
        // If no response data but status is good, consider it success
        if (res && (res.status === 200 || res.status === 201)) {
          setPasswordMessage("Password updated successfully!");

          // Clear all form data
          setCurrentPassword("");
          setNewPassword("");
          setRecoveryEmail("");
          setOtp("");
          setOtpSent(false);
          setOtpVerified(false);

          // Refresh the page after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setPasswordMessage(
            "Password update completed but no response data received."
          );
        }
      }
    } catch (err: any) {
      console.error("Password update error:", err);

      // Check if it's actually a success but caught as error
      if (
        err?.response?.status === 200 ||
        err?.response?.status === 201 ||
        err?.status === 200 ||
        err?.status === 201
      ) {
        setPasswordMessage("Password updated successfully!");

        // Clear all form data
        setCurrentPassword("");
        setNewPassword("");
        setRecoveryEmail("");
        setOtp("");
        setOtpSent(false);
        setOtpVerified(false);

        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setPasswordMessage(
          err?.response?.data?.message ||
            "Failed to update password. Please try again."
        );
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1">Security</h2>
        <p className="text-gray-500">
          Update your personal details, preferences, and travel settings all in
          one place.
        </p>
      </div>
      <form className="flex flex-col gap-6" onSubmit={handlePasswordSubmit}>
        <div>
          <h3 className="text-lg font-semibold mb-2">Change Password</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="w-full bg-white border border-[#d1d5db] shadow-sm rounded px-3 py-2 pr-10"
                  placeholder="Enter Your password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  tabIndex={-1}
                  onClick={() => setShowCurrentPassword((v) => !v)}
                >
                  {showCurrentPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="w-full bg-white border border-[#d1d5db] shadow-sm rounded px-3 py-2 pr-10"
                  placeholder="Enter Your New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  tabIndex={-1}
                  onClick={() => setShowNewPassword((v) => !v)}
                >
                  {showNewPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            {/* <div>
              <label className="block text-sm font-medium mb-1">
                Add Recovery Email
              </label>
              <input
                type="email"
                className="w-full bg-white border border-[#d1d5db] shadow-sm rounded px-3 py-2 pr-10"
                placeholder="email@example.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
              />
            </div> */}
          </div>
        </div>

        {/* OTP Section */}
        <div className=" pt-6">
          <div className="flex flex-col gap-4">
            {!otpSent ? (
              <Button
                type="button"
                variant="outline"
                color="secondary"
                isLoading={otpLoading}
                onClick={handleSendOtp}
                disabled={
                  !currentPassword.trim() ||
                  !newPassword.trim() ||
                  newPassword.trim().length < 6
                }
              >
                Send OTP
              </Button>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="border rounded px-3 py-2 w-32"
                    maxLength={6}
                    disabled={otpVerified}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    color="secondary"
                    isLoading={otpLoading}
                    onClick={handleVerifyOtp}
                    disabled={otpVerified || !otp.trim()}
                  >
                    Verify OTP
                  </Button>
                </div>
                {otpVerified && (
                  <span className="text-green-600 font-semibold">
                    ✓ OTP Verified Successfully
                  </span>
                )}
              </div>
            )}
            {otpMessage && (
              <div
                className={`text-sm ${
                  otpMessage.includes("verified") ||
                  otpMessage.includes("success")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {otpMessage}
              </div>
            )}
          </div>
        </div>

        {passwordMessage && (
          <div
            className={`text-sm font-medium ${
              passwordMessage.includes("success")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {passwordMessage}
          </div>
        )}

        <div className="flex gap-4 mt-6">
          <Button
            type="submit"
            variant="solid"
            color="secondary"
            className="bg-white text-[#FF6B6B] border border-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white transition-colors"
          >
            {" "}
            <Link href="/">Back</Link>
          </Button>

          {/* Show Save button only after OTP verification */}
          {otpVerified ? (
            <Button
              type="submit"
              variant="solid"
              color="secondary"
              isLoading={passwordLoading}
            >
              Save Changes
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              color="secondary"
              disabled
              className="opacity-50 cursor-not-allowed"
            >
              Verify OTP First
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
