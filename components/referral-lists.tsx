"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Check, X, Search, User2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyPage } from "./empty-page";
import { toast } from "sonner";
import type { IReferralResponse } from "@/types";

interface ReferralsListProps {
  link: string;
  referrals: IReferralResponse[];
  isLoading?: boolean;
}

export default function ReferralsList({
  link,
  referrals,
  isLoading = false,
}: ReferralsListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter referrals based on search term
  const filteredReferrals = referrals.filter(
    (referral) =>
      referral.referreeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referralCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyLink = (text = "") => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard", {
        richColors: true,
        closeButton: true,
      });
    });
  };

  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="text-lg">Your Referral History</CardTitle>
        <CardDescription>
          Track all your referrals and their status
        </CardDescription>

        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search referrals..."
            className="pl-8 rounded-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referree</TableHead>
                <TableHead>Email Verified</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reward Claimed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReferrals.length > 0 ? (
                filteredReferrals.map((referral) => (
                  <TableRow key={referral._id}>
                    <TableCell className="font-medium">
                      {referral.referreeName || "Unknown User"}
                    </TableCell>
                    <TableCell>
                      {referral.isEmailVerified ? (
                        <Badge
                          variant="outline"
                          className="border-green-500 text-green-600"
                        >
                          <Check className="mr-1 h-3 w-3" /> Verified
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-amber-500 text-amber-600"
                        >
                          <X className="mr-1 h-3 w-3" /> Unverified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(referral.createdAt)}</TableCell>
                    <TableCell>
                      <StatusBadge claimed={referral.rewardClaimed} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {searchTerm ? (
                      "No referrals match your search"
                    ) : (
                      <EmptyPage
                        className="w-full"
                        header="No referrals yet"
                        message="It looks like you have not refer any users yet, click the link below to get started."
                        icon={User2}
                      >
                        <Button
                          onClick={() => copyLink(link)}
                          className="rounded-none"
                        >
                          Copy Referral Link
                        </Button>
                      </EmptyPage>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ claimed }: { claimed: boolean }) {
  return claimed ? (
    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
      <Check className="mr-1 h-3 w-3" /> Claimed
    </Badge>
  ) : (
    <Badge variant="outline" className="border-amber-500 text-amber-600">
      <X className="mr-1 h-3 w-3" /> Unclaimed
    </Badge>
  );
}

function formatDate(dateString?: string): string {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch (e) {
    return dateString;
  }
}
