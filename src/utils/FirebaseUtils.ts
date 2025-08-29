// Import the functions you need from the SDKs you need
import { initializeApp } from "@firebase/app";
import {
  getAnalytics,
  logEvent,
  isSupported,
  type Analytics,
} from "@firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-3ntrn6-aKNFS3kZf5-36S_DVWja1oX0",
  authDomain: "idrama-a1e.firebaseapp.com",
  projectId: "idrama-a1e",
  storageBucket: "idrama-a1e.firebasestorage.app",
  messagingSenderId: "845611236937",
  appId: "1:845611236937:web:9b9a9e2d7443f51be74998",
  measurementId: "G-WH1Y9GBQWL",
};

const app = initializeApp(firebaseConfig);

// Initialize analytics with proper error handling
let analytics: Analytics | null = null;
let analyticsInitialized = false;

const initializeAnalytics = async () => {
  try {
    // Check if analytics is supported in current environment
    const supported = await isSupported();
    if (supported) {
      analytics = getAnalytics(app);
      analyticsInitialized = true;
      console.log("Firebase Analytics initialized successfully");
    } else {
      console.warn("Firebase Analytics is not supported in this environment");
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Analytics:", error);
  }
};

// Initialize analytics immediately
initializeAnalytics();

export const trackingIntro = async (
  actionName: string,
  actionType: string,
  extraInfo: Record<string, string> = {}
) => {
  try {
    // Wait for analytics to be initialized if it hasn't been yet
    if (!analyticsInitialized && analytics === null) {
      console.log("Waiting for Firebase Analytics to initialize...");
      await initializeAnalytics();

      // Give it a small delay to ensure it's fully ready
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (!analytics) {
      console.warn("Firebase Analytics not available, skipping tracking");
      return;
    }

    const defaultInfo = {
      action_type: actionType,
      action_name: actionName,
    };
    const params = { ...defaultInfo, ...extraInfo };

    console.log("Tracking event:", params);

    // Log the event
    await logEvent(analytics, "screen_active", params);

    console.log("Event tracked successfully");
  } catch (error) {
    console.error("Error tracking event:", error);
  }
};
