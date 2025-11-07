import { LOCAL_KEY } from "@/common/enums";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { getStorageItem, removeStorageItem } from "./storage";

type ErrorResponse = {
  errors?: { title?: string }[];
};

// Create a new Axios instance
const baseURL =
  process.env.NEXT_PUBLIC_BASE_URI ||
  process.env.NEXT_BASE_URI ||
  "http://localhost:3001";
console.log("🚀 HTTP Service initialized with baseURL:", baseURL);
const http: AxiosInstance = axios.create({
  baseURL,
  timeout: 600000,
});

// Request interceptor
http.interceptors.request.use(
  (config) => {
    const { url } = config;

    // URLs that don't need token
    const omitTokenUrls: string[] = [""];

    const accessToken: string | null = getStorageItem(LOCAL_KEY.ACCESS_TOKEN);

    if (accessToken && !omitTokenUrls.includes(url as string)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
http.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const errorData = error.response?.data as ErrorResponse;
    console.log(errorData?.errors?.[0]?.title ?? error.message);

    if (error.response && error.response.status === 401) {
      removeStorageItem(LOCAL_KEY.ACCESS_TOKEN);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } else {
      // Global error handler for all other errors
      if (typeof window !== "undefined") {
        console.log(
          errorData?.errors?.[0]?.title ||
            error.message ||
            "An unexpected error occurred. Please try again."
        );
      }
    }

    return Promise.reject(error);
  }
);

export default http;
