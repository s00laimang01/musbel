import { useTimeGreeting } from "@/hooks/use-time-greeting";
import { HeaderProps } from "@/types";

export default function Header({ name, balance }: HeaderProps) {
  const { message } = useTimeGreeting();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hi, {name}</h1>
        <p className="text-gray-500 mt-1 text-sm font-semibold">{message}</p>
      </div>

      <div className="flex items-baseline">
        <span className="text-6xl font-bold text-primary">{balance}</span>
        <span className="ml-2 text-gray-400">NGN</span>
      </div>
    </div>
  );
}
