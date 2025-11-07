"use client";
import React, { useState } from "react";
import SignInModal from "@/views/no-auth/layout/Header/SignInModal";
import SignUpModal from "@/views/no-auth/layout/Header/SignUpModal";

interface AuthModalControllerProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
}

export default function AuthModalController({ isOpen, onClose, initialMode = "signin" }: AuthModalControllerProps) {
  const [mode, setMode] = useState<"signin" | "signup">(() => initialMode);

  // Keep modal open if either mode is active
  if (!isOpen) return null;

  // Shared modal backdrop and container
  return (
    <div
      className="fixed inset-0 bg-opacity-40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[700px] bg-white rounded-lg overflow-hidden shadow-2xl mx-auto"
        onClick={e => e.stopPropagation()}
      >
        {mode === "signin" ? (
          <SignInModal
            isOpen={true}
            onClose={onClose}
            onSwitchToSignUp={() => setMode("signup")}
          />
        ) : (
          <SignUpModal
            isOpen={true}
            onClose={onClose}
            onSwitchToSignIn={() => setMode("signin")}
          />
        )}
      </div>
    </div>
  );
}
