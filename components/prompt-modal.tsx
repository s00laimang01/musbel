import React, { FC, ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";

const PromptModal: FC<{
  children?: ReactNode;
  title?: string;
  description?: string;
  onConfirm: () => void;
  _open?: boolean;
  onClose?: () => void;
}> = ({
  children,
  title = "Delete Account",
  description = "Are you sure you want to delete your account? Deleting your account mean you will lose access to all your data",
  onConfirm,
  _open = false,
  onClose = () => {},
}) => {
  const [open, setOpen] = React.useState(_open);

  return (
    <Dialog
      open={open}
      onOpenChange={(e) => {
        if (!e) {
          setOpen(false);
          onClose();
          return;
        }

        setOpen(e);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="rounded-none max-w-[90%]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              className="rounded-none text-primary hover:bg-white"
            >
              Close
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            className="text-white rounded-none"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromptModal;
