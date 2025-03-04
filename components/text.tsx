import { cn } from "@/lib/utils";
import React, { FC } from "react";

const Text: FC<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn("text-muted-foreground/60 text-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Text;
