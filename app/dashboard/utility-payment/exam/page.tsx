// "use client";

import BalanceCard from "@/components/balance-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useNavBar } from "@/hooks/use-nav-bar";
import { EXAMS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import React from "react";

const Page = () => {
  //   useNavBar("Exam");
  return (
    <div className="space-y-4">
      <BalanceCard />
      <div>
        <h2 className="text-sm font-bold tracking-tight text-primary">
          SELECT EXAM TYPE
        </h2>
        <div className="w-full grid grid-cols-2 gap-3 mt-3">
          {EXAMS.map((exam) => (
            <Button
              variant="outline"
              className="rounded-none text-primary hover:text-white font-bold"
              key={exam.planId}
            >
              {exam.label} - {formatCurrency(exam.amount, 0)}
            </Button>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <h2 className="text-sm font-bold tracking-tight text-primary">
          QUANTITY
        </h2>
        <Input className="h-[3rem] rounded-none mt-3" placeholder="QUANTITY" />
      </div>
      <Button variant="ringHover" className="w-full h-[3rem] rounded-none">
        BUY
      </Button>
    </div>
  );
};

export default Page;
