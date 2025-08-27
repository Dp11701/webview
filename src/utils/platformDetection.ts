// Platform detection utility
export type Platform = "ios" | "android" | "unknown";

export const detectPlatform = (): Platform => {
  // Method 1: Check for iOS webkit messageHandlers
  if (window.webkit?.messageHandlers?.event) {
    return "ios";
  }

  // Method 2: Check for Android bridge
  if ((window as any).AndroidBridge) {
    return "android";
  }

  // Method 3: Check user agent string
  const userAgent = navigator.userAgent.toLowerCase();
  if (
    userAgent.includes("iphone") ||
    userAgent.includes("ipad") ||
    userAgent.includes("ios")
  ) {
    return "ios";
  }
  if (userAgent.includes("android")) {
    return "android";
  }

  // Method 4: Check for platform-specific global objects
  if ((window as any).webkit || /iPad|iPhone|iPod/.test(navigator.userAgent)) {
    return "ios";
  }

  return "unknown";
};

export const getPlatformInfo = () => {
  const platform = detectPlatform();
  const userAgent = navigator.userAgent;

  return {
    platform,
    userAgent,
    isIOS: platform === "ios",
    isAndroid: platform === "android",
    hasWebkitBridge: !!window.webkit?.messageHandlers?.event,
    hasAndroidBridge: !!(window as any).AndroidBridge,
  };
};

// Hook để sử dụng trong React components
export const usePlatform = () => {
  const [platformInfo, setPlatformInfo] = useState(() => getPlatformInfo());

  useEffect(() => {
    // Có thể thêm listener cho các thay đổi platform (nếu cần)
    const info = getPlatformInfo();
    setPlatformInfo(info);
  }, []);

  return platformInfo;
};

// Import React hooks
import { useState, useEffect } from "react";
