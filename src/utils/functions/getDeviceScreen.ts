export const getDeviceScreen = () => {
  if (typeof window !== "undefined") {
    return window.innerWidth < 768 ? "sm" : "lg"; // You can adjust the breakpoint
  }
  return "lg"; // default for SSR or unknown
};
