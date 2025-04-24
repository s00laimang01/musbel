import type React from "react";
import { Tag, Zap, PiggyBank, UserRoundPlus } from "lucide-react";
import { PATHS } from "@/types";
import Link from "next/link";
import { FeatureCard } from "./feature-card";

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Link href={PATHS.ELECTRICITY_PAYMENTS} className="h-[12rem]">
        <FeatureCard
          icon={Zap}
          title="Electricity Bills"
          description="AEDC, IKEJA, KADUNA and More companies"
        />
      </Link>
      <Link href={PATHS.DATA_PLAN_PRICING} className="h-[12rem]">
        <FeatureCard
          icon={Tag}
          title="Check Rates"
          description="See pricing for data and airtime"
        />
      </Link>
      <Link href={PATHS.SETTINGS} className="h-[12rem]">
        <FeatureCard
          icon={PiggyBank}
          title="My Accounts"
          description="View your available and active accounts"
        />
      </Link>
      <Link href={PATHS.REFER} className="h-[12rem]">
        <FeatureCard
          icon={UserRoundPlus}
          title="Referrals"
          description="Start Earning by referring your family and friends to our platform"
        />
      </Link>
    </div>
  );
}
