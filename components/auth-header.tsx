import { AuthHeaderProps } from "@/types";

export function AuthHeader({
  title,
  description,
  showWaveEmoji = false,
}: AuthHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">
        {title} {showWaveEmoji && <span className="inline-block">👋</span>}
      </h1>
      {description}
    </div>
  );
}
