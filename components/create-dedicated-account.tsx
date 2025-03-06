"use client";

import React, { useState, useEffect, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { useAuthentication } from "@/hooks/use-authentication";
import VerifyEmail from "./verify-email";
import { api, errorMessage } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

// Form schema with validation
const formSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Full name must be at least 3 characters" })
    .optional(),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .optional(),
  phoneNumber: z
    .string()
    .min(11, { message: "Phone number must be at least 11 digits" })
    .optional(),
  bvn: z
    .string()
    .length(11, { message: "BVN must be exactly 11 digits" })
    .regex(/^\d+$/, { message: "BVN must contain only numbers" })
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Steps for the account creation process
type Step = "details" | "bvn" | "success";

export default function CreateDedicatedAccount({
  children,
}: {
  children: ReactNode;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthentication();

  // Form setup with validation
  const {
    register,
    formState: { errors },
    reset,
    ...form
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.fullName,
      email: user?.auth.email,
      phoneNumber: user?.phoneNumber,
      bvn: "",
    },
  });

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Handle form submission
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = {
      bvn: form.getValues("bvn"),
      fullName: form.getValues("fullName"),
      email: form.getValues("email"),
      phoneNumber: form.getValues("phoneNumber"),
    };

    if (currentStep === "details") {
      // Move to BVN step
      setCurrentStep("bvn");
      return;
    }

    if (currentStep === "bvn") {
      try {
        setIsSubmitting(true);

        // Validate BVN before submission
        if (!data.bvn || data.bvn.length !== 11) {
          toast.error("Please enter a valid 11-digit BVN");
          return;
        }

        // API call to securely store/transmit BVN
        await api.post("/users/me/verify-account/bvn/", {
          bvn: data.bvn,
        });

        toast.success(
          "BVN_ADDED: Assigning a virtual account for you, Please wait..."
        );

        // Move to success step
        setCurrentStep("success");
      } catch (error) {
        // Handle error
        toast.error(errorMessage(error).message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Reset form and state when dialog/drawer is closed
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setTimeout(() => {
        reset();
        setCurrentStep("details");
      }, 300);
    }
  };

  const sendVerificationCode = async () => {
    try {
      await api.post(`users/me/verify-account/`, { type: "email" });

      toast.success("Verification code sent successfully");
    } catch (error) {
      toast.error(errorMessage(error).message);
    }
  };

  // Content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case "details":
        return (
          <>
            <div className="mb-4">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium mb-1"
              >
                Full Name
              </label>
              <Input
                id="fullName"
                className="h-[3rem] rounded-none w-full border border-gray-300 px-3"
                placeholder="John Doe"
                readOnly
                value={user?.fullName || ""}
                {...register("fullName")}
              />
            </div>

            <div className="flex items-center gap-2 w-full mb-4">
              <div className="w-[80%]">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                >
                  Email
                </label>
                <Input
                  id="email"
                  className="h-[3rem] w-full rounded-none border border-gray-300 px-3"
                  type="email"
                  placeholder="john.doe@example.com"
                  readOnly
                  value={user?.auth.email || ""}
                  {...register("email")}
                />
              </div>
              <VerifyEmail email={user?.auth.email}>
                <Button
                  onClick={sendVerificationCode}
                  type="button"
                  disabled={user?.isEmailVerified}
                  className="h-[3rem] w-[20%] rounded-none mb-0 bg-primary text-white mt-6"
                >
                  Verify
                </Button>
              </VerifyEmail>
            </div>

            <div className="mb-4">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium mb-1"
              >
                Phone Number
              </label>
              <input
                id="phoneNumber"
                className="h-[3rem] rounded-none w-full border border-gray-300 px-3"
                placeholder="08012345678"
                readOnly
                value={user?.phoneNumber || ""}
                {...register("phoneNumber")}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </>
        );
      case "bvn":
        return (
          <div>
            <label htmlFor="bvn" className="block text-sm font-medium mb-1">
              Bank Verification Number (BVN)
            </label>
            <input
              id="bvn"
              className="h-[3rem] rounded-none w-full border border-gray-300 px-3"
              placeholder="Enter your 11-digit BVN"
              maxLength={11}
              inputMode="numeric"
              {...register("bvn", {
                onChange: (e) => {
                  // Only allow numeric input
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                },
              })}
            />
            <p className="text-sm text-gray-500 mt-1">
              Your BVN is securely stored and will be used to create your
              dedicated account.
            </p>
            {errors.bvn && (
              <p className="text-red-500 text-sm mt-1">{errors.bvn.message}</p>
            )}
          </div>
        );
      case "success":
        return (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">
              Account Created Successfully!
            </h3>
            <p className="mb-6 text-gray-500">
              Your dedicated account has been created. You will receive your
              account details shortly.
            </p>
            <button
              onClick={() => handleOpenChange(false)}
              className="w-full bg-primary text-white h-[3rem] rounded-none"
            >
              Close
            </button>
          </div>
        );
    }
  };

  // Button text based on current step
  const getButtonText = () => {
    switch (currentStep) {
      case "details":
        return "Continue to BVN Verification";
      case "bvn":
        return isSubmitting
          ? "Creating Account..."
          : "Create Dedicated Account";
      default:
        return "";
    }
  };

  // Common content for both dialog and drawer
  const formContent = (
    <form onSubmit={onSubmit} className="space-y-4">
      {renderStepContent()}
      {currentStep !== "success" && (
        <Button
          type="submit"
          className="w-full mt-4 rounded-none h-[3.5rem] bg-primary text-white font-medium flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <span className="mr-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </span>
          )}
          {getButtonText()}
          {!isSubmitting && currentStep === "details" && (
            <ChevronRight className="ml-2 h-4 w-4" />
          )}
        </Button>
      )}
    </form>
  );

  // Title and description based on current step
  const getTitle = () => {
    switch (currentStep) {
      case "details":
        return "Create Dedicated Account";
      case "bvn":
        return "BVN Verification";
      case "success":
        return "Account Created";
    }
  };

  const getDescription = () => {
    switch (currentStep) {
      case "details":
        return "Fill in your details to create a dedicated account";
      case "bvn":
        return "Please provide your BVN to verify your identity";
      case "success":
        return "Your dedicated account has been created successfully";
    }
  };

  // Render dialog for desktop and drawer for mobile
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="border-b pb-4">
            <DrawerTitle className="font-bold text-primary">
              {getTitle()}
            </DrawerTitle>
            <DrawerDescription>{getDescription()}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-6">{formContent}</div>
          {currentStep !== "success" && (
            <DrawerFooter className="pt-0">
              <DrawerClose asChild>
                <button
                  className="text-primary hover:bg-gray-100 h-[3rem] rounded-none border border-gray-300 px-4 w-full"
                  type="button"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </button>
              </DrawerClose>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl rounded-none">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        <div className="py-4">{formContent}</div>
        {currentStep !== "success" && (
          <DialogFooter>
            <button
              className="text-primary hover:bg-gray-100 h-[3rem] rounded-none border border-gray-300 px-4"
              onClick={() => handleOpenChange(false)}
              type="button"
            >
              Cancel
            </button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
