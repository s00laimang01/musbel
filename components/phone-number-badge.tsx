import { getNetworkLogo } from "@/lib/utils";
import type { recentPurchaseNumbers } from "@/types";
import Image from "next/image";
import type { FC } from "react";
import Text from "./text";

const PhoneNumberBadge: FC<recentPurchaseNumbers> = ({
  network,
  onSelect = () => {},
  ...props
}) => {
  return (
    <div
      onClick={() => onSelect(props.number)}
      className="border-green-600 border cursor-pointer hover:bg-primary/10 flex gap-2 items-center py-2 px-1 rounded-none w-[8rem] shrink-0"
    >
      <Image
        src={getNetworkLogo(network) || "/placeholder.svg"}
        alt={`${network}-logo`}
        width={20}
        height={20}
        className="rounded-full object-contain"
      />
      <Text className="text-xs font-bold text-primary">{props.number}</Text>
    </div>
  );
};

export default PhoneNumberBadge;
