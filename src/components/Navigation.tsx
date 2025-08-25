import { Link, useLocation } from "react-router-dom";

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "🏠 Home", color: "bg-blue-500 hover:bg-blue-600" },
    {
      path: "/about",
      label: "ℹ️ About",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      path: "/settings",
      label: "⚙️ Settings",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <nav className="fixed bottom-4 left-4 right-4 bg-white shadow-lg rounded-xl p-4">
      <div className="flex justify-center gap-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`py-2 px-4 text-white rounded-lg transition text-sm font-medium ${
              location.pathname === item.path
                ? "ring-2 ring-offset-2 ring-gray-400 " + item.color
                : item.color
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
