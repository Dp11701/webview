export default function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        gap: "12px",
        color: "#111827",
        backgroundColor: "#ffffff",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        role="img"
      >
        <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="4" />
        <path
          d="M22 12a10 10 0 0 1-10 10"
          stroke="#3b82f6"
          strokeWidth="4"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="0.9s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      <span style={{ fontSize: "14px", letterSpacing: "0.01em" }}>
        Loading…
      </span>
    </div>
  );
}
