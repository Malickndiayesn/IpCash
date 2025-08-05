interface IPCashLogoProps {
  variant?: "color" | "light" | "icon" | "light-icon";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function IPCashLogo({ 
  variant = "color", 
  size = "md", 
  className = "" 
}: IPCashLogoProps) {
  const logoMap = {
    color: "/attached_assets/lgogo-ipcash_-01 Color_1754420424053.png",
    light: "/attached_assets/lgogo-ipcash_-02 light_1754420424054.png", 
    icon: "/attached_assets/lgogo-ipcash_-03_1754420424054.png",
    "light-icon": "/attached_assets/lgogo-ipcash_-04 Light_1754420424055.png"
  };

  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  return (
    <img 
      src={logoMap[variant]}
      alt="IPCASH"
      className={`${sizeMap[size]} ${className}`}
    />
  );
}