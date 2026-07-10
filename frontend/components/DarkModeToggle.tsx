"use client";

interface Props {
  dark: boolean;
  onToggle: () => void;
}

export default function DarkModeToggle({ dark, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900"
      style={{ backgroundColor: dark ? "#e94560" : "#4b5563" }}
    >
      <span
        className={`
          inline-block w-4 h-4 transform rounded-full bg-white shadow transition-transform duration-200
          ${dark ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  );
}
