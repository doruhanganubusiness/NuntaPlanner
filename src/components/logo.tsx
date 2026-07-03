import { cn } from "@/lib/utils";
import Image from "next/image";

/**
 * Logo-ul NuntaPlanner: iconul (heart + ring + checkmark) + numele.
 * `showText={false}` afișează doar iconul.
 */
export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt="NuntaPlanner"
        width={548}
        height={572}
        priority
        className="h-8 w-auto"
      />
      {showText && (
        <span className="text-lg font-semibold text-primary">NuntaPlanner</span>
      )}
    </span>
  );
}
