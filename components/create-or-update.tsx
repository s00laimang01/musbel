"use client";

import { type FC, type ReactNode, useState, useEffect } from "react";
import { useMediaQuery } from "@uidotdev/usehooks";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { api, errorMessage } from "@/lib/utils";

interface CreateOrUpdatePinProps {
  children: ReactNode;
  mode: "create" | "update";
  onSuccess?: (newPin: string) => void;
  onCancel?: () => void;
  verifyCurrentPin?: (pin: string) => Promise<boolean>;
}

// Define the possible steps in the PIN creation/update process
type Step = "enterCurrentPin" | "enterNewPin" | "confirmNewPin" | "success";

const CreateOrUpdatePin: FC<CreateOrUpdatePinProps> = ({
  children,
  mode,
  onCancel,
  verifyCurrentPin,
}) => {
  const [open, setOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(
    mode === "update" ? "enterCurrentPin" : "enterNewPin"
  );

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Reset state when modal is opened/closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setCurrentPin("");
        setNewPin("");
        setConfirmPin("");
        setError(null);
        setCurrentStep(mode === "update" ? "enterCurrentPin" : "enterNewPin");
      }, 300); // Delay to allow animation to complete
    }
  }, [open, mode]);

  const createTransactionPin = async (pin: string) => {
    try {
      const res = await api.post<{ message: string }>(`/auth/pin/`, {
        pin,
        confirmPin,
      });

      toast(res.data.message);
    } catch (error) {
      throw error;
    }
  };

  const changeTransactionPin = async () => {
    try {
      const res = await api.patch<{ message: string }>(`/auth/pin/update/`, {
        newPin,
        oldPin: currentPin,
        confirmPin,
      });
      toast(res.data.message);
    } catch (error) {
      throw error;
    }
  };

  const handleVerifyCurrentPin = async () => {
    if (currentPin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If we have a verify function, use it, otherwise just proceed
      const isValid = verifyCurrentPin
        ? await verifyCurrentPin(currentPin)
        : true;

      if (isValid) {
        setCurrentStep("enterNewPin");
      } else {
        setError("Incorrect PIN. Please try again.");
        setCurrentPin("");
      }
    } catch (err) {
      setError("Failed to verify PIN. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPin = async () => {
    if (newPin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    // Basic PIN validation
    if (/^(.)\1{3}$/.test(newPin)) {
      setError("PIN cannot be all the same digits");
      return;
    }

    if (/^(0123|1234|2345|3456|4567|5678|6789|7890)$/.test(newPin)) {
      setError("PIN cannot be sequential digits");
      return;
    }

    // If updating, check that new PIN is different from current
    if (mode === "update" && newPin === currentPin) {
      setError("New PIN must be different from current PIN");
      return;
    }

    setError(null);
    setCurrentStep("confirmNewPin");
  };

  const handleConfirmPin = async () => {
    try {
      if (mode === "create") {
        await createTransactionPin(newPin);
        setCurrentStep("success");
      } else {
        await changeTransactionPin();
        setCurrentStep("success");
      }

      // Close modal after a brief delay
      setTimeout(() => setOpen(false), 1500);
    } catch (error) {
      toast.error(errorMessage(error).message);
    }
  };

  const handleBack = () => {
    if (currentStep === "enterNewPin" && mode === "update") {
      setCurrentStep("enterCurrentPin");
    } else if (currentStep === "confirmNewPin") {
      setCurrentStep("enterNewPin");
    }
    setError(null);
  };

  const handleCancel = () => {
    setOpen(false);
    onCancel?.();
  };

  const renderStepTitle = () => {
    switch (currentStep) {
      case "enterCurrentPin":
        return "Enter Current PIN";
      case "enterNewPin":
        return mode === "create" ? "Create PIN" : "Enter New PIN";
      case "confirmNewPin":
        return "Confirm PIN";
      case "success":
        return "PIN Successfully Set";
      default:
        return "";
    }
  };

  const renderStepDescription = () => {
    switch (currentStep) {
      case "enterCurrentPin":
        return "Please enter your current 4-digit transaction PIN";
      case "enterNewPin":
        return "Please create a new 4-digit transaction PIN";
      case "confirmNewPin":
        return "Please confirm your new PIN by entering it again";
      case "success":
        return mode === "create"
          ? "Your PIN has been created successfully"
          : "Your PIN has been updated successfully";
      default:
        return "";
    }
  };

  const enterCurrentPin = (
    <div>
      <div className="flex justify-center mb-6">
        <InputOTP maxLength={4} value={currentPin} onChange={setCurrentPin}>
          <InputOTPGroup>
            <InputOTPSlot className="w-12 h-12 rounded-none" index={0} />
            <InputOTPSlot className="w-12 h-12 rounded-none" index={1} />
            <InputOTPSlot className="w-12 h-12 rounded-none" index={2} />
            <InputOTPSlot className="w-12 h-12 rounded-none" index={3} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="flex justify-between gap-2 mt-4">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
          className=" bg-white text-primary hover:bg-primary hover:text-white rounded-none"
        >
          Cancel
        </Button>
        <Button
          variant="ringHover"
          onClick={handleVerifyCurrentPin}
          disabled={currentPin.length !== 4 || loading}
          className="rounded-none"
        >
          {loading ? "Verifying..." : "Continue"}
        </Button>
      </div>
    </div>
  );

  const enterNewPin = (
    <>
      <div className="flex justify-center mb-6">
        <InputOTP maxLength={4} value={newPin} onChange={setNewPin}>
          <InputOTPGroup>
            <InputOTPSlot className="w-12 h-12 rounded-none" index={0} />
            <InputOTPSlot className="w-12 h-12 rounded-none" index={1} />
            <InputOTPSlot className="w-12 h-12 rounded-none" index={2} />
            <InputOTPSlot className="w-12 h-12 rounded-none" index={3} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="flex justify-between gap-2 mt-4">
        {mode === "update" ? (
          <Button
            variant="outline"
            className=" bg-white text-primary rounded-none hover:bg-primary hover:text-white"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : (
          <Button
            variant="outline"
            className=" bg-white text-primary rounded-none hover:bg-primary hover:text-white"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSetNewPin}
          disabled={newPin.length !== 4}
          className="rounded-none"
          variant="ringHover"
        >
          Continue
        </Button>
      </div>
    </>
  );

  const confirmNewPin = (
    <div>
      <div className="flex justify-center mb-6">
        <InputOTP maxLength={4} value={confirmPin} onChange={setConfirmPin}>
          <InputOTPGroup>
            <InputOTPSlot className="w-12 h-12 rounded-none" index={0} />
            <InputOTPSlot className="w-12 h-12 rounded-none" index={1} />
            <InputOTPSlot className="w-12 h-12 rounded-none" index={2} />
            <InputOTPSlot className="w-12 h-12 rounded-none" index={3} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="flex justify-between gap-2 mt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className=" bg-white text-primary hover:bg-primary hover:text-primary rounded-none"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleConfirmPin}
          disabled={confirmPin.length !== 4}
          className="rounded-none"
          variant="ringHover"
        >
          Confirm
        </Button>
      </div>
    </div>
  );

  const success = (
    <div className="flex flex-col items-center justify-center py-4">
      <ShieldCheck className="w-16 h-16 text-primary mb-4" />
      <p className="text-center text-muted-foreground">
        {mode === "create"
          ? "Your transaction PIN has been created."
          : "Your transaction PIN has been updated."}
      </p>
    </div>
  );

  const views: Record<Step, any> = {
    enterCurrentPin: enterCurrentPin,
    enterNewPin: enterNewPin,
    confirmNewPin: confirmNewPin,
    success: success,
  };

  const pinContent = (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">{renderStepTitle()}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {renderStepDescription()}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {views[currentStep]}
    </div>
  );

  if (isMobile) {
    return (
      <div>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTitle className=" sr-only" />
          <DrawerTrigger asChild>{children}</DrawerTrigger>
          <DrawerContent className="p-4">{pinContent}</DrawerContent>
        </Drawer>
      </div>
    );
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger onClick={() => setOpen(true)} asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="sr-only" />
          {pinContent}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateOrUpdatePin;
