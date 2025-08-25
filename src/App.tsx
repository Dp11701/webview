import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  const sendMessageToMobile = () => {
    const message = {
      type: "BUTTON_CLICK",
      payload: {
        clickedAt: Date.now(),
        message: "User clicked the button!",
        count: count + 1,
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

    setCount(count + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 text-center">
        <h1 className="text-xl font-bold mb-4">📱 Webview Demo</h1>
        <p className="text-gray-600 mb-6">
          Button clicked <span className="font-semibold">{count}</span> times
        </p>
        <button
          onClick={sendMessageToMobile}
          className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition"
        >
          Send Event To Mobile
        </button>
      </div>
    </div>
  );
}
