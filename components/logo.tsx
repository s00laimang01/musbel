import { configs } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

const Logo: FC<{
  name?: string;
  className?: string;
  showLogo?: boolean;
  showName?: boolean;
  to?: string;
}> = ({
  name = configs.appName,
  className,
  showLogo = true,
  showName = false,
  to = "/",
}) => {
  return (
    <Link href={to} className={cn("flex items-center gap-1", className)}>
      {showLogo && (
        <Image width={70} height={70} src="/next.svg" alt="appLogo" />
      )}
      {showName && <h2 className="text-xl italic font-bold">{name}</h2>}
    </Link>
  );
};

export default Logo;
