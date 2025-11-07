"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { setStorageItem } from "@/services/storage";
import { LOCAL_KEY } from "@/common/enums";
import { useSetAtom } from "jotai";
import { userAtom } from "@/app/atoms/auth";
import { jwtDecode } from "jwt-decode";
import http from "@/services/http";
import Swal from "sweetalert2";

type JwtPayload = {
  sub: number;
  email: string;
  firstName?: string;
  lastName?: string;
};

export default function VerifyOtpPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const setUser = useSetAtom(userAtom);
  const returnTo = localStorage.getItem("returnTo") || "/";
  // localStorage.removeItem("returnTo");

  const handleVerify = async () => {
    if (!email || !otp) return;

    try {
      setLoading(true);
      const { data } = await http.post("/users/verify-otp-2FA", { email, otp });

      if (data?.user) {
        const userData = {
          email: data?.user?.email,
          id: data?.user?.id,
          phone: data?.user?.phone,
          firstName: data?.user?.firstName,
          lastName: data?.user?.lastName,
        };

        setStorageItem(LOCAL_KEY.ACCESS_TOKEN, data?.token);
        setStorageItem(LOCAL_KEY.USER, JSON.stringify(userData));
        setUser(userData);
        // router.push("/");
        router.push(returnTo);
      }else{
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: data?.message,
          confirmButtonColor: "#FF6B6B",
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-xl font-semibold mb-4">Enter OTP</h1>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
        className="border px-4 py-2 rounded mb-4"
      />
      <button
        onClick={handleVerify}
        disabled={loading}
        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
    </div>
  );
}
