import React from "react";

interface LogoProps {
  className?: string;
  variant?: "horizontal" | "stacked" | "iconOnly";
  theme?: "light" | "dark";
  iconSize?: number;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  variant = "horizontal",
  theme = "light",
  iconSize = 32,
}) => {
  const isDark = theme === "dark";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const emeraldColor = "#10B981"; // Emerald 500 do tailwind

  const Icon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Símbolo Stitch: 3 Chevrons/Triângulos empilhados */}
      <path
        d="M20 5L35 15H5L20 5Z"
        fill={emeraldColor}
        fillOpacity="0.4"
      />
      <path
        d="M20 12L35 22H5L20 12Z"
        fill={emeraldColor}
        fillOpacity="0.7"
      />
      <path
        d="M20 19L35 29H5L20 19Z"
        fill={emeraldColor}
      />
      <path
        d="M20 26L35 36H5L20 26Z"
        fill={emeraldColor}
        fillOpacity="0.3"
      />
    </svg>
  );

  if (variant === "iconOnly") {
    return <Icon />;
  }

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <Icon />
        <span
          className={`text-xl font-bold tracking-tight ${textColor}`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Captando
        </span>
      </div>
    );
  }

  // Horizontal (Default)
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Icon />
      <span
        className={`text-xl font-bold tracking-tight ${textColor}`}
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Captando
      </span>
    </div>
  );
};
