"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { setStorageItem } from "@/services/storage";
import { LOCAL_KEY } from "@/common/enums";
import { useSetAtom } from "jotai";
import { userAtom } from "@/app/atoms/auth";

type JwtPayload = {
  sub: number;
  email: string;
  firstName?: string;
  lastName?: string;
};

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    const token = params.get("token");
    const twoFactorRequired = params.get("twoFactorRequired");
    const email = params.get("email");
    const returnTo = localStorage.getItem("returnTo") || "/";
    // console.log("saved url before removing",returnTo)
    // localStorage.removeItem("returnTo");
    if (twoFactorRequired === "true" && email) {
      router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
      return;
    }

    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);

        const userData = {
          email: decoded?.email,
          id: decoded?.sub,
          firstName: decoded?.firstName,
          lastName: decoded?.lastName,
        };

        setStorageItem(LOCAL_KEY.ACCESS_TOKEN, token);
        setStorageItem(LOCAL_KEY.USER, JSON.stringify(userData));
        setUser(userData);
        router.push(returnTo);
      } catch (error) {
        console.error("Invalid token", error);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [params, router]);

  return <p>Signing you in...</p>;
}
