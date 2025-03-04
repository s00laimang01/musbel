import { HeaderProps } from "@/types";

export default function Header({
  name,
  fullName,
  email,
  balance,
}: HeaderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hi, {name}</h1>
        <p className="text-gray-500 mt-1 text-sm font-semibold">
          Late hours! You've worked hard today, get some well-deserved rest. 🍊
        </p>
      </div>

      <div className="flex items-baseline">
        <span className="text-6xl font-bold text-primary">{balance}</span>
        <span className="ml-2 text-gray-400">NGN</span>
      </div>
    </div>
  );
}
