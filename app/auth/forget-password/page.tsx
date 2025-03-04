import { AuthHeader } from "@/components/auth-header";
import { PrivacyFooter } from "@/components/privacy-footer";
import Text from "@/components/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

const Page = () => {
  return (
    <div className="space-y-6">
      <AuthHeader
        title="Forgot your password?"
        description={
          <Text>We will send a reset token to your email account.</Text>
        }
      />

      <form className="space-y-4">
        <div className="space-y-2">
          <Input
            id="email"
            type="email"
            placeholder="Email Address"
            className="h-[3rem] rounded-none"
          />
        </div>

        <Button
          type="submit"
          variant="ringHover"
          className="w-full bg-primary hover:bg-primary/90 rounded-none h-[3rem]"
        >
          Reset My Password
        </Button>
      </form>

      <PrivacyFooter />
    </div>
  );
};

export default Page;
