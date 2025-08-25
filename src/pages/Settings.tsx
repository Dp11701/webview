import { useState } from "react";

export default function Settings() {
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);

  const sendSettingsMessage = () => {
    const message = {
      type: "SETTINGS_UPDATED",
      payload: {
        updatedAt: Date.now(),
        settings: {
          theme,
          notifications,
        },
        message: "User updated settings!",
      },
    };

    // 👉 Android (Kotlin) nhận qua AndroidBridge
    if ((window as any).AndroidBridge?.postMessage) {
      (window as any).AndroidBridge.postMessage(JSON.stringify(message));
    }

    // 👉 iOS (WKWebView) nhận qua messageHandlers
    if ((window as any).webkit?.messageHandlers?.ReactNativeWebView) {
      (window as any).webkit.messageHandlers.ReactNativeWebView.postMessage(
        JSON.stringify(message)
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-50 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-xl font-bold mb-4 text-center">⚙️ Settings Page</h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Push Notifications
            </label>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full ${
                notifications ? "bg-purple-500" : "bg-gray-300"
              } relative transition-colors`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  notifications ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <button
          onClick={sendSettingsMessage}
          className="w-full py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition"
        >
          Send Settings To Mobile
        </button>
      </div>
    </div>
  );
}
