import { getInitials } from "@/lib/utils";

interface AvatarProps {
  image?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-16 h-16 text-2xl",
};

export function Avatar({ image, name, size = "md", className = "" }: AvatarProps) {
  const sizeClass = sizes[size];
  const base = `${sizeClass} rounded-full flex-shrink-0 ${className}`;

  if (image) {
    return (
      <img
        src={image}
        alt={name ?? ""}
        className={`${base} object-cover`}
      />
    );
  }

  return (
    <div className={`${base} bg-indigo-600 flex items-center justify-center text-white font-bold`}>
      {getInitials(name)}
    </div>
  );
}
