"use client";

import BalanceCard from "@/components/balance-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useNavBar } from "@/hooks/use-nav-bar";
import { api, cn, errorMessage, formatCurrency } from "@/lib/utils";
import type { exam } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import EnterPin from "@/components/enter-pin";

const Page = () => {
  useNavBar("Exam");

  const [isPending, startTransition] = useState(false);
  const { isLoading, data: exams = [] } = useQuery({
    queryKey: ["exams"],
    queryFn: async () =>
      (await api.get<{ data: exam[] }>(`/create/exam/`)).data.data,
  });

  const [data, setData] = useState({
    examId: "",
    quantity: "",
  });

  const buyExam = async (pin: string) => {
    try {
      startTransition(true);
      const res = await api.post<{ message: string }>(`/purchase/exam/`, {
        pin,
        ...data,
      });

      toast(res.data.message);
    } catch (error) {
      toast.error(errorMessage(error).message);
    } finally {
      startTransition(false);
    }
  };

  return (
    <div className="space-y-4">
      <BalanceCard />
      <div>
        <h2 className="text-sm font-bold tracking-tight text-primary">
          SELECT EXAM TYPE
        </h2>
        <div className="w-full grid grid-cols-2 gap-3 mt-3">
          {isLoading ? (
            // Show skeleton loaders while loading
            <>
              <Skeleton className="h-10 w-full rounded-none" />
              <Skeleton className="h-10 w-full rounded-none" />
              <Skeleton className="h-10 w-full rounded-none" />
              <Skeleton className="h-10 w-full rounded-none" />
            </>
          ) : (
            // Map through the fetched exams data
            exams.map((exam) => (
              <Button
                variant={exam._id === data.examId ? "default" : "outline"}
                className={cn(
                  "rounded-none  hover:text-white font-bold",
                  exam._id !== data.examId && "text-primary"
                )}
                key={exam._id}
                onClick={() => setData({ ...data, examId: exam._id! })}
              >
                {exam.examType.toUpperCase()} - {formatCurrency(exam.amount, 0)}
              </Button>
            ))
          )}
        </div>
      </div>
      <Separator />
      <div>
        <h2 className="text-sm font-bold tracking-tight text-primary">
          QUANTITY
        </h2>
        <Input
          className="h-[3rem] rounded-none mt-3"
          placeholder="QUANTITY"
          value={data.quantity}
          onChange={(e) => {
            if (isNaN(Number(e.target.value))) return;
            setData({ ...data, quantity: e.target.value });
          }}
        />
      </div>
      <EnterPin onVerify={buyExam}>
        <Button
          variant="ringHover"
          className="w-full h-[3rem] rounded-none"
          disabled={isLoading || isPending || !data.examId || !data.quantity}
        >
          BUY
        </Button>
      </EnterPin>
    </div>
  );
};

export default Page;
