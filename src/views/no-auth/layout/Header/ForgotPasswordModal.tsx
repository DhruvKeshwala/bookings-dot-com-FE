import { useState } from "react";
import Button from "@/components/ui/NewButton";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  isLoading: boolean;
}

export default function ForgotPasswordModal({ isOpen, onClose, onSubmit, isLoading }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-[1px]">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm mx-auto flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-center">Forgot Password</h2>
        <p className="mb-6 text-center text-gray-700">Enter your email address and we will send a password reset link if it exists in our system.</p>
        <form
          className="w-full flex flex-col items-center"
          onSubmit={e => {
            e.preventDefault();
            if (!isLoading && email) {
              onSubmit(email);
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
          <Button
            type="submit"
            isLoading={isLoading}
            variant="solid"
            color="secondary"
            className=" px-6 py-2 rounded font-bold w-full hover:bg-coral-dark transition-colors"
            disabled={isLoading || !email}
          >
            {isLoading ? 'Sending...' : 'OK'}
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
