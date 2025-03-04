import Link from "next/link";
import Text from "./text";
import { configs } from "@/lib/constants";

export function PrivacyFooter() {
  return (
    <Text className="text-xs">
      By continuing, I represent that I have read, understand, and fully agree
      to the {configs.appName}{" "}
      <Link href="/terms" className="text-primary hover:underline">
        terms of service
      </Link>{" "}
      and{" "}
      <Link href="/privacy" className="text-primary hover:underline">
        privacy policy
      </Link>
      .
    </Text>
  );
}
