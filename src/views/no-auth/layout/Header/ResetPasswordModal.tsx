import React, { useState } from "react";
import Button from "@/components/ui/NewButton";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { email: string; newPassword: string }) => void;
  isLoading: boolean;
  initialEmail?: string;
}

export default function ResetPasswordModal({ isOpen, onClose, onSubmit, isLoading, initialEmail }: ResetPasswordModalProps) {
  const [email, setEmail] = useState(initialEmail || "");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Update email if initialEmail changes (e.g. after forgot password)
  React.useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-sm">
      <div className=" rounded-lg shadow-xl p-8 w-full max-w-sm mx-auto flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-center">Reset Password</h2>
  <p className="mb-6 text-center text-gray-700">Enter your email and your new password to reset your password.</p>
        <form
          className="w-full flex flex-col items-center"
          onSubmit={e => {
            e.preventDefault();
            if (!isLoading && email && newPassword) {
              onSubmit({ email, newPassword });
            }
          }}
        >
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-lg text-black text-base focus:outline-none focus:ring-2 focus:ring-coral"
          />
          <div className="relative w-full mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-base focus:outline-none focus:ring-2 focus:ring-coral pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              tabIndex={-1}
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-11-7 1.21-2.71 3.44-4.88 6.32-6.29m3.68-.71c.66-.1 1.33-.15 2-.15 5 0 9.27-3.11 11-7-.49-1.1-1.19-2.1-2.05-2.97M1 1l22 22"/></svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M2.05 12a10.94 10.94 0 0 1 19.9 0 10.94 10.94 0 0 1-19.9 0z"/></svg>
              )}
            </button>
          </div>
          <Button
            type="submit"
            isLoading={isLoading}
            variant="solid"
            color="secondary"
            className=" px-6 py-2 rounded font-bold w-full hover:bg-coral-dark transition-colors"
            disabled={isLoading || !email || !newPassword}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
        <button
          className="mt-4 text-gray-500 hover:underline text-sm"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
