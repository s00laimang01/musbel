"use client";

import ReferralsList from "@/components/referral-lists";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { useAuthentication } from "@/hooks/use-authentication";
import { useNavBar } from "@/hooks/use-nav-bar";
import type { apiResponse } from "@/lib/utils";
import type { IReferralResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const Page = () => {
  useNavBar("Referrals");

  const { user } = useAuthentication();

  const { isLoading, data } = useQuery({
    queryKey: ["referrals"],
    queryFn: async () =>
      (
        await axios.get<
          apiResponse<{
            referrals: IReferralResponse[];
            totalReferrals: number;
          }>
        >(`/api/users/referrals/`)
      ).data.data,
  });

  const LINK = `https://abanty-data-sme-amber.vercel.app/auth/sign-up/?ref=${user?.phoneNumber}`;

  const copyLink = (text = "") => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard", {
        richColors: true,
        closeButton: true,
      });
    });
  };
  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold text-primary/80 md:block hidden">
          Referral Details
        </h2>
      </header>
      <Card className="bg-primary/80 rounded-sm mt-4">
        <CardContent className="space-y-3">
          <CardDescription className="font-semibold text-white/80">
            {"BELOW ARE YOUR REFERRAL DETAILS"}
          </CardDescription>
          <div className="w-full flex items-center justify-between">
            <CardTitle className="text-4xl font-bold text-white flex gap-2 items-end">
              {isLoading ? (
                <div className="h-10 w-10 animate-pulse bg-white/20 rounded"></div>
              ) : (
                data?.totalReferrals || 0
              )}
              <CardDescription className="text-white/80">
                Referrals
              </CardDescription>
            </CardTitle>

            <Button
              onClick={() => copyLink(LINK)}
              className="rounded-sm bg-white/20 hover:bg-white/30"
            >
              Copy Link
            </Button>
          </div>
          <CardDescription className="text-white/80 line-clamp-1">
            {LINK}
          </CardDescription>
        </CardContent>
      </Card>
      <ReferralsList
        link={LINK}
        referrals={data?.referrals || []}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Page;
