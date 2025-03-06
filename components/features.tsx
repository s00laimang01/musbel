import type React from "react";
import { Tag, Download, Zap, PiggyBank } from "lucide-react";
import { FeatureCardProps, PATHS } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function FeatureCard({
  title,
  description,
  icon: Icon,
  ...props
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "bg-gray-50 hover:bg-gray-100 cursor-pointer overflow-hidden transition-colors rounded-lg p-6 relative group",
        props.className
      )}
    >
      <Icon size={40} className="text-primary mb-6" />
      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-950 mb-1">
        {title}
      </h3>
      <p className="text-gray-500 group-hover:text-gray-100 text-sm z-10 relative">
        {description}
      </p>

      {/* Background Icon */}
      <Icon
        size={150}
        className="absolute top-2 right-3 opacity-10 group-hover:opacity-70 transition-opacity"
      />

      {/* Animated background overlay that comes from bottom */}
      <div
        className={cn(
          "absolute w-full h-0 bg-primary/50 left-0 bottom-0 rounded-lg transition-all duration-300 ease-out group-hover:h-full",
          props.className
        )}
      />
    </div>
  );
}

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Link href={PATHS.ELECTRICITY_PAYMENTS}>
        <FeatureCard
          icon={Zap}
          title="Electricity Bills"
          description="AEDC, IKEJA, KADUNA and More companies"
          className="h-[12rem]"
        />
      </Link>
      <Link href={PATHS.HOME}>
        <FeatureCard
          icon={Tag}
          title="Check Rates"
          description="See pricing for data and airtime"
          className="h-[12rem]"
        />
      </Link>
      <Link href={PATHS.SETTINGS}>
        <FeatureCard
          icon={PiggyBank}
          title="My Accounts"
          description="View your available and active accounts"
          className="h-[12rem]"
        />
      </Link>
      <FeatureCard
        icon={Download}
        title="Download Data"
        description="If you have want to download your data, it's right here!"
        className="h-[12rem]"
      />
    </div>
  );
}
