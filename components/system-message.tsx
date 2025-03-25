import { api } from "@/lib/utils";
import { systemMessage } from "@/types";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";

const SystemMessage = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: systemMessage } = useQuery({
    queryKey: ["system-message"],
    queryFn: async () =>
      (await api.get<{ data: systemMessage }>(`/users/message/`)).data.data,
    refetchInterval: 60 * 100,
  });

  useEffect(() => {
    if (!systemMessage?.message) return;

    if (systemMessage?.message?.length > 1) {
      const oldMessage = Cookies.get("system-message");

      if (!oldMessage) {
        setIsOpen(true);
      }

      if (oldMessage !== systemMessage.messageId) {
        setIsOpen(true);
      }
    }
  }, [systemMessage]);

  const handleClose = () => {
    setIsOpen(false);
    const now = new Date();

    now.setDate(now.getDate() + 2);

    Cookies.set("system-message", systemMessage?.messageId!, { expires: now });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="rounded-none md:max-w-lg w-[95%]">
        <DialogHeader>
          <DialogTitle>{systemMessage?.title || "System Message"}</DialogTitle>
          <DialogDescription>{systemMessage?.message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ringHover"
            className="rounded-none"
            onClick={handleClose}
          >
            Acknowledge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SystemMessage;
