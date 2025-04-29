"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiResponse } from "@/lib/utils";
import { IReferralResponse } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReferralApiResponse {
  referrals: IReferralResponse[];
  pagination: Record<string, any>;
}

const Page = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-referrals"],
    queryFn: async () => {
      const response = await api.get<apiResponse<ReferralApiResponse>>(
        "/admin/referrals"
      );
      return response.data;
    },
  });

  // Mutation for handling reward claims
  const toggleRewardMutation = useMutation({
    mutationFn: async ({ id, claimed }: { id: string; claimed: boolean }) => {
      return api.patch(`/admin/referrals/${id}`, { rewardClaimed: !claimed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-referrals"] });
      toast.success("Reward status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update reward status");
    },
  });

  // Sort referrals by count if data exists
  const sortedReferrals = data?.data.referrals?.sort((a, b) => {
    return b.referralCount - a.referralCount;
  });

  // Get top 3 referrers
  const topReferrers = sortedReferrals
    ?.reduce((acc, curr) => {
      if (!acc.find((ref) => ref.user === curr.user)) {
        acc.push(curr);
      }
      return acc;
    }, [] as IReferralResponse[])
    .slice(0, 3);

  return (
    <div className="space-y-6 p-3 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
        <p className="text-muted-foreground text-sm">
          Manage and monitor user referrals
        </p>
      </div>

      {/* Top Referrers */}
      <div className="grid gap-4 md:grid-cols-3">
        {topReferrers?.map((referrer, index) => (
          <Card
            key={referrer.user}
            className="relative overflow-hidden rounded-sm"
          >
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {index === 0
                  ? "Highest Referrer"
                  : index === 1
                  ? "Second Highest"
                  : "Third Highest"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {referrer.referreeName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {referrer.referreeEmail}
                  </div>
                  <div className="text-sm font-medium text-primary mt-1">
                    {referrer.referralCount} referrals
                  </div>
                </div>
                <Trophy
                  className={`h-8 w-8 ${
                    index === 0
                      ? "text-yellow-500"
                      : index === 1
                      ? "text-gray-500"
                      : "text-bronze-500"
                  }`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Referrals Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referrer Name</TableHead>
              <TableHead>Referrer Email</TableHead>
              <TableHead>Referral Code</TableHead>
              <TableHead>Referree Name</TableHead>
              <TableHead>Referree Email</TableHead>
              <TableHead>Referral Count</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reward Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.data.referrals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  No referrals found
                </TableCell>
              </TableRow>
            ) : (
              data?.data.referrals?.map((referral) => (
                <TableRow key={referral._id} className="h-14">
                  <TableCell>{referral.referreeName}</TableCell>
                  <TableCell>{referral.referreeEmail}</TableCell>
                  <TableCell>{referral.referralCode}</TableCell>
                  <TableCell>{referral.referreeName}</TableCell>
                  <TableCell>{referral.referreeEmail}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{referral.referralCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        referral.isEmailVerified ? "success" : "destructive"
                      }
                    >
                      {referral.isEmailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={referral.rewardClaimed ? "success" : "secondary"}
                    >
                      {referral.rewardClaimed ? "Claimed" : "Unclaimed"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            toggleRewardMutation.mutate({
                              id: referral._id!,
                              claimed: referral.rewardClaimed,
                            })
                          }
                        >
                          {referral.rewardClaimed
                            ? "Mark as Unclaimed"
                            : "Mark as Claimed"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Page;
