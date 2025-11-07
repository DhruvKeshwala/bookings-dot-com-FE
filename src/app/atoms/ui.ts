"use client";

import { atom } from "jotai";

// Global app loading flag for pages that need to control header elements visibility
export const appLoadingAtom = atom<boolean>(false);