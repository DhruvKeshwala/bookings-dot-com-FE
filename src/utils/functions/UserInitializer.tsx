"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { LOCAL_KEY } from "@/common/enums";
import { getStorageItem } from "@/services/storage";
import { userAtom } from "@/app/atoms/auth";

export const UserInitializer = () => {
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    const rawUser = getStorageItem(LOCAL_KEY.USER);
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        setUser(parsed);
      } catch (e) {
        console.error("Failed to parse user:", e);
      }
    }
  }, []);

  return null;
};
