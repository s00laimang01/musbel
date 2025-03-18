"use client";

import { useState, useEffect } from "react";
import {
  Edit,
  Lock,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Save,
  X,
  User,
  Mail,
  Phone,
  DollarSign,
  Globe,
  Landmark,
  Plus,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IUser } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Interface for dedicated account number
interface AccountDetailsTypes {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
}

interface DedicatedAccountNumber {
  accountDetails: AccountDetailsTypes;
  user: string;
  hasDedicatedAccountNumber: boolean;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  order_ref: string;
}

interface ActionButtonsProps {
  user: IUser;
  userAccount?: DedicatedAccountNumber;
  onAction: (action: string, userId: string, data?: any) => Promise<void>;
}

export function UserActionButtons({
  user,
  userAccount,
  onAction,
}: ActionButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    type: string;
    title: string;
    description: string;
  } | null>(null);

  // Form state for edit mode
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    country: "",
    balance: 0,
    isEmailVerified: false,
    isPhoneVerified: false,
    hasSetPin: false,
  });

  // Track if form has been modified
  const [isFormModified, setIsFormModified] = useState(false);

  // Initialize form data when user data changes or edit dialog opens
  useEffect(() => {
    if (user && currentAction?.type === "edit") {
      setFormData({
        fullName: user.fullName || "",
        email: user.auth?.email || "",
        phoneNumber: user.phoneNumber || "",
        country: user.country || "",
        balance: user.balance || 0,
        isEmailVerified: user.isEmailVerified || false,
        isPhoneVerified: user.isPhoneVerified || false,
        hasSetPin: user.hasSetPin || false,
      });
      setIsFormModified(false);
    }
  }, [user, currentAction]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsFormModified(true);
  };

  const handleAction = async () => {
    if (!currentAction) return;

    try {
      setIsLoading(currentAction.type);

      // For edit action, pass the form data
      if (currentAction.type === "edit") {
        await onAction(currentAction.type, user._id!, formData);
      } else if (currentAction.type === "generateAccount") {
        await onAction("generateAccount", user._id!);
      } else {
        await onAction(currentAction.type, user._id!);
      }

      setDialogOpen(false);
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const openDialog = (type: string, title: string, description: string) => {
    setCurrentAction({ type, title, description });
    setDialogOpen(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-6">
        <Button
          variant="default"
          size="sm"
          className="rounded-none bg-primary text-primary-foreground"
          onClick={() =>
            openDialog(
              "edit",
              "Edit User",
              "Make changes to this user account."
            )
          }
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit User
        </Button>

        <Button
          variant="default"
          size="sm"
          className="rounded-none bg-primary text-primary-foreground"
          onClick={() =>
            openDialog(
              "resetPassword",
              "Reset Password",
              "Send a password reset link to this user."
            )
          }
        >
          <Lock className="h-4 w-4 mr-2" />
          Reset Password
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="rounded-none"
          onClick={() =>
            openDialog(
              "generateAccount",
              "User Dedicated Virtual Account",
              "View or generate a dedicated virtual account for this user."
            )
          }
        >
          <Landmark className="h-4 w-4 mr-2" />
          User Account
        </Button>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open && isFormModified && currentAction?.type === "edit") {
            if (
              confirm(
                "You have unsaved changes. Are you sure you want to close?"
              )
            ) {
              setDialogOpen(false);
            }
          } else {
            setDialogOpen(false);
          }
        }}
      >
        <DialogContent
          className={cn(
            "rounded-none",
            currentAction?.type === "edit" && "sm:max-w-[600px]"
          )}
        >
          <DialogHeader>
            <DialogTitle>{currentAction?.title}</DialogTitle>
            <DialogDescription>{currentAction?.description}</DialogDescription>
          </DialogHeader>

          {currentAction?.type === "edit" ? (
            <div className="py-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 rounded-none">
                  <TabsTrigger value="basic" className="rounded-none">
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="account" className="rounded-none">
                    Account
                  </TabsTrigger>
                  <TabsTrigger value="verification" className="rounded-none">
                    Verification
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label
                        htmlFor="fullName"
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        className="rounded-none h-[2.5rem]"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label
                        htmlFor="email"
                        className="flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="rounded-none h-[2.5rem]"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label
                        htmlFor="phoneNumber"
                        className="flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Phone Number
                      </Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          handleInputChange("phoneNumber", e.target.value)
                        }
                        className="rounded-none h-[2.5rem]"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label
                        htmlFor="country"
                        className="flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        Country
                      </Label>
                      <Select
                        defaultValue={user.country}
                        onValueChange={(value) =>
                          handleInputChange("country", value)
                        }
                      >
                        <SelectTrigger className="rounded-none h-[2.5rem]">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nigeria">Nigeria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="account" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label
                        htmlFor="balance"
                        className="flex items-center gap-2"
                      >
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        Balance
                      </Label>
                      <Input
                        id="balance"
                        type="number"
                        value={formData.balance}
                        onChange={(e) => {
                          if (isNaN(e.target.valueAsNumber)) return;

                          handleInputChange(
                            "balance",
                            Number(e.target.valueAsNumber)
                          );
                        }}
                        className="rounded-none h-[2.5rem]"
                        placeholder="Enter balance"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label
                        htmlFor="status"
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        Status
                      </Label>
                      <Select
                        defaultValue={user.status || "active"}
                        onValueChange={(value) =>
                          handleInputChange("status", value)
                        }
                      >
                        <SelectTrigger className="rounded-none h-[2.5rem]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="role" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Role
                      </Label>
                      <Select
                        defaultValue={user.role || "user"}
                        onValueChange={(value) =>
                          handleInputChange("role", value)
                        }
                      >
                        <SelectTrigger className="rounded-none">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="verification" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="emailVerified"
                        className="flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email Verified
                      </Label>
                      <Switch
                        id="emailVerified"
                        checked={formData.isEmailVerified}
                        onCheckedChange={(checked) =>
                          handleInputChange("isEmailVerified", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="phoneVerified"
                        className="flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Phone Verified
                      </Label>
                      <Switch
                        id="phoneVerified"
                        checked={formData.isPhoneVerified}
                        onCheckedChange={(checked) =>
                          handleInputChange("isPhoneVerified", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="hasSetPin"
                        className="flex items-center gap-2"
                      >
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        PIN Set
                      </Label>
                      <Switch
                        id="hasSetPin"
                        checked={formData.hasSetPin}
                        onCheckedChange={(checked) =>
                          handleInputChange("hasSetPin", checked)
                        }
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {isFormModified && (
                <div className="bg-amber-50 border border-amber-200 p-2 mt-4 rounded-none flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-amber-700">
                    You have unsaved changes
                  </span>
                </div>
              )}
            </div>
          ) : currentAction?.type === "generateAccount" ? (
            <div className="py-4">
              {userAccount && userAccount.hasDedicatedAccountNumber ? (
                <Card className="rounded-none border-green-200 bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Landmark className="h-4 w-4 text-green-600" />
                        Dedicated Account
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-700 hover:bg-green-100"
                      >
                        Active
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Account Name
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {userAccount.accountDetails.accountName}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              copyToClipboard(
                                userAccount.accountDetails.accountName,
                                "Account Name"
                              )
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Account Number
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {userAccount.accountDetails.accountNumber}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              copyToClipboard(
                                userAccount.accountDetails.accountNumber,
                                "Account Number"
                              )
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Bank
                        </span>
                        <span className="font-medium">
                          {userAccount.accountDetails.bankName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Bank Code
                        </span>
                        <span className="font-medium">
                          {userAccount.accountDetails.bankCode}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Created
                        </span>
                        <span className="font-medium">
                          {userAccount.createdAt
                            ? new Date(
                                userAccount.createdAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Order Reference
                        </span>
                        <span className="font-medium">
                          {userAccount.order_ref}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="p-4 rounded-full bg-muted">
                    <Landmark className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-medium">No Dedicated Account</h3>
                    <p className="text-sm text-muted-foreground">
                      This user doesn't have a dedicated virtual account yet.
                    </p>
                  </div>
                  <Button
                    disabled={userAccount?.hasDedicatedAccountNumber}
                    variant="default"
                    size="sm"
                    className="rounded-none bg-primary text-primary-foreground"
                    onClick={() => {
                      setCurrentAction({
                        type: "generateAccount",
                        title: "Generate Account",
                        description:
                          "Generate a dedicated virtual account for this user.",
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Account
                  </Button>
                </div>
              )}
            </div>
          ) : currentAction?.type === "generateAccount" ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Landmark className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center space-y-2 max-w-sm">
                <h3 className="font-medium">Generate Virtual Account</h3>
                <p className="text-sm text-muted-foreground">
                  This will create a dedicated virtual account for{" "}
                  {user.fullName || "this user"}. The account will be
                  automatically generated through our payment provider.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex py-4 w-full justify-center">
              {
                <div className="p-4 rounded-full bg-primary/10">
                  {currentAction?.type === "resetPassword" && (
                    <Lock className="h-10 w-10 text-primary" />
                  )}
                </div>
              }
            </div>
          )}

          <DialogFooter
            className={
              currentAction?.type === "edit" ||
              currentAction?.type === "generateAccount"
                ? "border-t pt-4"
                : ""
            }
          >
            {currentAction?.type !== "generateAccount" ||
            !userAccount?.hasDedicatedAccountNumber ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none"
                  onClick={() => setDialogOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                {(currentAction?.type === "edit" ||
                  currentAction?.type === "resetPassword" ||
                  currentAction?.type === "generateAccount") && (
                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-none bg-primary text-primary-foreground"
                    onClick={handleAction}
                    disabled={
                      !!isLoading ||
                      (currentAction?.type === "edit" && !isFormModified) ||
                      (currentAction.type === "generateAccount" &&
                        !userAccount?.hasDedicatedAccountNumber)
                    }
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : currentAction?.type === "edit" ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    ) : currentAction?.type === "generateAccount" ? (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Account
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="rounded-none"
                onClick={() => setDialogOpen(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
