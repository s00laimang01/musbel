"use client";

import { EmptyPage } from "@/components/empty-page";
import { Button } from "@/components/ui/button";
import { useNavBar } from "@/hooks/use-nav-bar";
import { PATHS } from "@/types";
import { CircleOff } from "lucide-react";
import Link from "next/link";
import React from "react";

const Page = () => {
  useNavBar("Transactions");
  return (
    <EmptyPage
      icon={CircleOff}
      header="No Transactions Recorded Yet!"
      message="If you have any transactions there will all appear here, Thank You"
    >
      <div className=" gap-3 flex items-center">
        <Button variant="ringHover" asChild size="lg" className="rounded-none">
          <Link href={PATHS.BUY_DATA}>BUY DATA</Link>
        </Button>
        <Button variant="ringHover" asChild size="lg" className="rounded-none">
          <Link href={PATHS.BUY_AIRTIME}>BUY AIRTIME</Link>
        </Button>
      </div>
    </EmptyPage>
  );
};

export default Page;
