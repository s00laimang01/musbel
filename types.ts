import { LucideProps } from "lucide-react";
import { ReactNode } from "react";

// AUTHENTICATION
export interface AuthHeaderProps {
  title: string;
  description?: ReactNode;
  showWaveEmoji?: boolean;
}

// PATHS
export enum PATHS {
  SIGNIN = "/auth/sign-in/",
  SIGNUP = "/auth/sign-up/",
  FORGET_PASSWORD = "/auth/forget-password/",
  TOP_UP_ACCOUNT = "/dashboard/top-up/",
  HOME = "/dashboard/home/",
  WALLET = "/dashboard/wallet/",
  BUY_DATA = "/dashboard/buy-data/",
  BUY_AIRTIME = "/dashboard/buy-airtime/",
  UTILITY_PAYMENT = "/dashboard/utility-payment/",
  TRANSACTIONS = "/dashboard/transactions/",
  SETTINGS = "/dashboard/settings/",
  ELECTRICITY_PAYMENTS = "/dashboard/utility-payment/electricity/",
  EXAM = "/dashboard/utility-payment/exam",
  RECHARGE_CARD = "/dashboard/utility-payment/recharge-card/",
}

// DASHBOARD
export interface HeaderProps {
  name: string;
  fullName: string;
  email: string;
  balance: string;
}

// BUY-DATA
export type dataTypes = "SME";

export type availableNetworks = "mtn" | "glo" | "airtel" | "9mobile";

export interface recentPurchaseNumbers {
  number: string;
  network: availableNetworks;
  dataPlan: string;
  amount: number;
  date: string;
  onSelect?: (phoneNumber: string) => void;
}

export interface dataPlan {
  network: string;
  data: string;
  amount: number;
  type: dataTypes;
  availability: string;
  isPopular?: boolean;
}

export interface FeatureCardProps {
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  title: string;
  description: string;
  className?: string;
}

export interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

// STORES
export interface dashboardStore {
  // Getters
  title: string;

  // Setters
  setTitle: (title: string) => void;
}
