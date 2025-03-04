import { cn } from "@/lib/utils";
import { LucideProps } from "lucide-react";
import { FC, ReactNode } from "react";

export const EmptyPage: FC<{
  message?: string;
  header?: string;
  children?: ReactNode;
  className?: string;
  icon?: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}> = ({
  message = "Get started by adding your first product to your store.",
  header = "No products found",
  children = <div className="sr-only" />,
  ...rest
}) => {
  return (
    <div
      className={cn(
        "flex h-[23rem] space-y-3 flex-col items-center justify-center p-8 text-center rounded-lg",
        rest.className
      )}
    >
      <div className="bg-muted/30 p-4 rounded-full">
        {rest.icon && <rest.icon className="h-12 w-12 text-muted-foreground" />}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-medium mb-2">{header}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {children}
    </div>
  );
};
