import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { accountStatus } from "@/types";

interface UserStatusBadgeProps {
  status: accountStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  switch (status) {
    case "active":
      return (
        <Badge
          variant="outline"
          className="px-3 py-1 bg-green-50 text-green-700 border-green-200"
        >
          <ShieldCheck className="h-4 w-4 mr-1" />
          Active Account
        </Badge>
      );
    case "inactive":
      return (
        <Badge
          variant="outline"
          className="px-3 py-1 bg-red-50 text-red-700 border-red-200"
        >
          <ShieldAlert className="h-4 w-4 mr-1" />
          Inactive Account
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="px-3 py-1">
          <Shield className="h-4 w-4 mr-1" />
          {status}
        </Badge>
      );
  }
}
