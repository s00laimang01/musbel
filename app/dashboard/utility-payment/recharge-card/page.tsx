"use client";

import { EmptyPage } from "@/components/empty-page";
import { Button } from "@/components/ui/button";
import { useNavBar } from "@/hooks/use-nav-bar";
import { PATHS } from "@/types";
import { CircleOff } from "lucide-react";
import Link from "next/link";
import React from "react";

const Page = () => {
  useNavBar("Recharge Card");
  return (
    <div className="">
      <EmptyPage
        icon={CircleOff}
        header="This service is not available at this moment"
        message=" "
      >
        <Button asChild size="lg" variant="ringHover" className="rounded-none">
          <Link href={PATHS.BUY_DATA}>BUY DATA</Link>
        </Button>
      </EmptyPage>
    </div>
  );
};

export default Page;
