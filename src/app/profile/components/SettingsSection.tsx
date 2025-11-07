"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/NewButton";
// import LogoutButton from "@/components/ui/LogoutButton";
import { removeStorageItem } from "@/services/storage";
import { LOCAL_KEY } from "@/common/enums";
import http from "@/services/http";
import { AxiosError } from "axios";

import { getStorageItem } from "@/services/storage";
import { EmailIcon } from "@/components/icons/EmailIcon";
import { MailCheck, MailCheckIcon, MessageCircle } from "lucide-react";

export default function SettingsSection() {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // On mount, fetch user profile to get true 2FA state
  useEffect(() => {
    const fetchProfile = async () => {
      const token = getStorageItem(LOCAL_KEY.ACCESS_TOKEN);
      if (!token) return;
      try {
        const profileRes = await http.get("/users/user-detail", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userObj = profileRes?.data?.user;
        setUser(userObj);
        setTwoFAEnabled(!!userObj?.isTwoFactorEnabled);
      } catch {
        // fallback: do nothing
      }
    };
    fetchProfile();
  }, []);

  // Always use isTwoFactorEnabled from user profile
  const handleToggle2FA = async () => {
    setTwoFALoading(true);
    try {
      const token = getStorageItem(LOCAL_KEY.ACCESS_TOKEN);
      const desiredState = !twoFAEnabled;

      // Call API to toggle
      await http.post(
        "/users/2fa-toggle",
        { enable: desiredState },
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );

      // Fetch latest user profile
      const profileRes = await http.get(
        "/users/user-detail",
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
      const userObj = profileRes?.data?.user;
      setUser(userObj);
      setTwoFAEnabled(!!userObj?.isTwoFactorEnabled);

      // ✅ Show alert based on new state
      alert(
        userObj?.isTwoFactorEnabled
          ? "Two-Factor Authentication has been enabled successfully."
          : "Two-Factor Authentication has been disabled."
      );
    } catch {
      alert("Failed to update 2FA setting. Please try again.");
    } finally {
      setTwoFALoading(false);
    }
  };

  // Prevent background scroll when modal is open

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  // Try user.email, then user.profile.email, fallback to empty string
  const email = user?.email || user?.profile?.email || "";

  const countryFlag = email.startsWith("+91") ? "🇮🇳" : "";

  // Prevent background scroll when modal is open
  useEffect(() => {
    const el = document.documentElement;
    if (showDeleteModal) {
      el.classList.add("overflow-hidden");
    } else {
      el.classList.remove("overflow-hidden");
    }
    return () => {
      el.classList.remove("overflow-hidden");
    };
  }, [showDeleteModal]);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await http.post("/users/delete-account");
      alert(
        "Delete account response: " + JSON.stringify(response?.data || response)
      );
      setShowDeleteModal(false);
      if (typeof window !== "undefined") {
        localStorage.clear();
        window.location.href = "/";
      }
    } catch (err) {
      let message = "Failed to delete account";
      if (err && typeof err === "object") {
        const axiosErr = err as AxiosError<any>;
        if (
          "response" in axiosErr &&
          axiosErr.response &&
          axiosErr.response.data &&
          (axiosErr.response.data as any).message
        ) {
          message = (axiosErr.response.data as any).message;
        } else if ("message" in err) {
          message = String((err as any).message);
        }
      }
      alert("Delete account error: " + message);
      setDeleteError(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1">Setting</h2>
        <p className="text-gray-500">
          Update your personal details, preferences, and travel settings all in
          one place.
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-2 relative">
        {user === null && (
          <div className="text-red-600 font-semibold mb-2">
            Error: User profile could not be loaded. Please check your login or
            backend API.
          </div>
        )}
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Two Factor authentication</h3>
          <label className="inline-flex items-center cursor-pointer relative w-14 h-7">
            <input
              type="checkbox"
              checked={twoFAEnabled}
              onChange={() => {
                // Only allow toggle if not loading
                if (!twoFALoading) handleToggle2FA();
              }}
              disabled={twoFALoading}
              className="sr-only peer"
              aria-label="Toggle two factor authentication"
            />
            <span
              className={`block w-12 h-6 rounded-full transition-colors duration-200 ${
                twoFAEnabled ? "bg-[#016aa2]" : "bg-gray-300"
              }`}
            ></span>
            <span
              className={`absolute left-1 top-1 w-5 h-5 bg-white border border-gray-300 rounded-full shadow transition-transform duration-200 ${
                twoFAEnabled ? "translate-x-6" : ""
              }`}
              style={{ pointerEvents: "none" }}
            ></span>
            {twoFALoading && (
              <span className="absolute right-[-2.5rem] text-xs text-gray-400">
                ...
              </span>
            )}
          </label>
        </div>
        <p className="text-gray-500 text-sm mb-2 w-[430px]">
          We&apos;ll send an authentication code to this emaileach time you
          sign in to your Launcherr account.
        </p>
        <div className="flex items-center gap-2 text-lg font-medium">
          <MailCheckIcon className="text-[#ff6b6b]" />
          <span>{email}</span>
        </div>
      </div>
      {/* <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-2 relative">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Active sessions</h3>
          <button type="button" className="text-[#ff6b6b] font-medium">
            Sign out
          </button>
        </div>
        <p className="text-gray-500 text-sm">
          Selecting `{"Sign out"}` will sign you out from all devices except
          this one.
        </p>
      </div> */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-2 relative">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Delete account</h3>
          <button
            type="button"
            className="text-[#ff6b6b] font-medium cursor-pointer"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete account
          </button>
        </div>
        <p className="text-gray-500 text-sm">Permanently delete your account</p>
        {showDeleteModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-xs"
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-lg font-semibold mb-4 text-center">
                Are you sure you want to delete your account?
              </h4>
              {deleteError && (
                <div className="text-red-500 text-sm mb-2">{deleteError}</div>
              )}
              <div className="flex gap-4 mt-2">
                <Button
                  className="px-6 py-2 rounded text-white font-semibold cursor-pointer"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes"}
                </Button>
                <Button
                  className="px-6 py-2 rounded border border-gray-300 bg-white text-gray-700 cursor-pointer font-semibold"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  No
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-2 relative">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Logout</h3>
          <button
            type="button"
            className="text-[#ff6b6b] font-medium cursor-pointer"
            onClick={() => {
              removeStorageItem(LOCAL_KEY.ACCESS_TOKEN);
              removeStorageItem(LOCAL_KEY.USER);
              localStorage.removeItem("TEMP_LOGIN_TOKEN");
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </div>
        <p className="text-gray-500 text-sm">Sign out from your account</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto">
        <Button
          type="submit"
          variant="solid"
          color="secondary"
          className="bg-white text-[#FF6B6B] border border-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white transition-colors"
        >
          {" "}
          <Link href="/">Back</Link>
        </Button>
      </div>
    </div>
  );
}
