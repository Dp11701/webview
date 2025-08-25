export default function About() {
  const sendAboutMessage = () => {
    const message = {
      type: "ABOUT_PAGE_VISITED",
      payload: {
        visitedAt: Date.now(),
        message: "User visited the About page!",
        page: "about",
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 text-center">
        <h1 className="text-xl font-bold mb-4">ℹ️ About Page</h1>
        <p className="text-gray-600 mb-6">
          This is a webview app built with React and React Router. It
          demonstrates communication between web content and mobile apps.
        </p>

        <button
          onClick={sendAboutMessage}
          className="w-full py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition"
        >
          Send About Event To Mobile
        </button>
      </div>
    </div>
  );
}
