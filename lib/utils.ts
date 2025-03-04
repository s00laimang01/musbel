import { availableNetworks, dataPlan } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getNetworkLogo = (network: availableNetworks) => {
  const logos: Record<availableNetworks, string> = {
    mtn: "/mtn-logo.png",
    glo: "/glo-logo.png",
    airtel: "/airtel-logo.png",
    "9mobile": "/9mobile-logo.png",
  };

  return logos[network];
};

export const generateDate = () => {
  const currentDate = new Date();

  const [days, month] = [
    Math.floor(Math.random() * 30),
    Math.floor(Math.random() * 12),
  ];

  currentDate.setDate(currentDate.getDate() - days);
  currentDate.setMonth(currentDate.getMonth() - month);

  return currentDate.toISOString();
};

export const sortPlan = (plans: dataPlan[], network?: availableNetworks) => {
  let _plans: dataPlan[] = [];
  _plans = plans.sort((plan) => (plan.isPopular ? -1 : 1));

  if (!network) return _plans;

  return _plans.filter(
    (plan) => plan.network.toLowerCase() === network.toLowerCase()
  );
};

export const isPathMathching = (path: string) => {
  const Window = typeof window !== "undefined" && window;

  if (Window) {
    const location = Window.location.pathname.split("/");

    return path.split("/")[2] === location[2];
  }
};

export const formatCurrency = (amount: number, mfd = 1) => {
  return new Intl.NumberFormat("en-NG", {
    currency: "NGN",
    style: "currency",
    minimumFractionDigits: mfd,
  }).format(amount);
};
