"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/NewButton";
import { Eye, EyeOff } from "lucide-react";
import http from "@/services/http";

// Separate component to handle search params
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!email || !token || !newPassword) {
      setMessage("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      await http.post("/users/reset-password", {
        email,
        token,
        newPassword,
      });
      setMessage("Password reset successful. You can now sign in with your new password.");
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-[0.8] bg-form flex flex-col justify-center items-center p-6 overflow-y-auto">
      <div className="w-full max-w-md px-3">
        {/* Brand Name */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7EFA6E] to-[#2FAEFF] bg-clip-text text-transparent font-poppins">
            Travulu
          </h1>
        </div>

        {/* Form Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray mb-2 font-inter">
            Reset Password
          </h2>
          <p className="text-gray text-sm font-inter">
            Enter your new password below to secure your account.
          </p>
        </div>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          {/* Email – styled pill like read-only */}
          <div className="mb-4">
            <label className="block text-black font-bold text-sm mb-2 font-nunito">Email</label>
            <div className="w-full h-[60px] px-4 flex items-center rounded-lg bg-white border border-[#b3b3b3] text-black text-base">
              {email || "email@example.com"}
            </div>
          </div>

          {/* New Password */}
          <div className="mb-2">
            <label className="block text-black font-bold text-sm mb-2 font-nunito">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full h-[60px] px-4 pr-12 border border-[#b3b3b3] rounded-lg bg-white text-black text-base focus:outline-none focus:ring-2 focus:ring-coral"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-black/70 text-xs mt-2 font-nunito">
              Password must be at least 8 characters long
            </p>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            variant="solid"
            color="secondary"
            className="w-full mt-4"
            disabled={loading || !newPassword}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        {message && (
          <div className={`mt-4 text-center text-sm ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

// Loading fallback component
function ResetPasswordLoading() {
  return (
    <div className="flex-[0.8] bg-form flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md px-3">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7EFA6E] to-[#2FAEFF] bg-clip-text text-transparent font-poppins">
            Travulu
          </h1>
        </div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral mx-auto"></div>
          <p className="text-gray text-sm mt-2">Loading...</p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
      <div className="relative w-full max-w-6xl max-h-[700px] bg-white rounded-lg overflow-hidden shadow-2xl mx-auto">
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

          {/* Right Side - Form with Suspense */}
          <Suspense fallback={<ResetPasswordLoading />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
