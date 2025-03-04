import {
  availableNetworks,
  dataPlan,
  PATHS,
  recentPurchaseNumbers,
} from "@/types";
import z from "zod";
import { generateDate } from "./utils";
import { CreditCard, GraduationCap, Zap } from "lucide-react";

export const configs = {
  appName: "KINTA SME",
};

// FORM SCHEMAS
export const signUpSchema = z.object({
  fullName: z.string().min(3, "Full Name is too short"),
  country: z.enum(["nigeria"]),
  phoneNumber: z.string().min(11, "Please use a valid phone number."),
  email: z.string().email(),
  password: z.string().min(6, "Password is too short"),
});

export const dataPlans: dataPlan[] = [
  {
    network: "MTN",
    data: "1GB",
    amount: 300,
    type: "SME",
    availability: "24 hours",
    isPopular: true,
  },
  {
    network: "Glo",
    data: "5GB",
    amount: 1500,
    type: "SME",
    availability: "30 days",
  },
  {
    network: "Airtel",
    data: "500MB",
    amount: 200,
    type: "SME",
    availability: "24 hours",
  },
  {
    network: "9mobile",
    data: "10GB",
    amount: 3000,
    type: "SME",
    availability: "30 days",
    isPopular: true,
  },
  {
    network: "MTN",
    data: "2GB",
    amount: 700,
    type: "SME",
    availability: "7 days",
  },
  {
    network: "Glo",
    data: "20GB",
    amount: 5000,
    type: "SME",
    availability: "30 days",
  },
  {
    network: "Airtel",
    data: "1.5GB",
    amount: 500,
    type: "SME",
    availability: "7 days",
    isPopular: true,
  },
  {
    network: "9mobile",
    data: "50MB",
    amount: 50,
    type: "SME",
    availability: "24 hours",
  },
  {
    network: "MTN",
    data: "100GB",
    amount: 30000,
    type: "SME",
    availability: "365 days",
  },
  {
    network: "Glo",
    data: "10GB",
    amount: 2500,
    type: "SME",
    availability: "30 days",
  },
];

export const AVIALABLE_NETWORKS: availableNetworks[] = [
  "mtn",
  "glo",
  "airtel",
  "9mobile",
];

export const DEMO_PHONE_NUMBERS: recentPurchaseNumbers[] = [
  {
    amount: 1000,
    dataPlan: "",
    date: generateDate(),
    network: "mtn",
    number: "07061508325",
  },
  {
    amount: 2000,
    dataPlan: "",
    date: generateDate(),
    network: "airtel",
    number: "08123164428",
  },
  {
    amount: 3000,
    dataPlan: "",
    date: generateDate(),
    network: "mtn",
    number: "09130404752",
  },
  {
    amount: 4000,
    dataPlan: "",
    date: generateDate(),
    network: "glo",
    number: "08032108745",
  },
];

export const FREQUENTLY_PURCHASE_AIRTIME = [
  100, 200, 300, 400, 500, 1000, 2000, 5000, 10000,
];

export const Utilities = [
  {
    label: "Electricity",
    path: PATHS.ELECTRICITY_PAYMENTS,
    icon: Zap,
  },
  {
    label: "Result Checker",
    path: PATHS.EXAM,
    icon: GraduationCap,
  },
  {
    label: "Print Recharge Card",
    path: PATHS.RECHARGE_CARD,
    icon: CreditCard,
  },
];

export const ELECTRICITY_COMPANIES = [
  {
    label: "Ikeja Electricity",
    disco: 1,
  },
  {
    label: "Eko Electricity",
    disco: 2,
  },
  {
    label: "Kano Electricity",
    disco: 3,
  },
  {
    label: "Port Harcourt Electricity",
    disco: 4,
  },
  {
    label: "Jos Electricity",
    disco: 5,
  },
  {
    label: "Ibadan Electricity",
    disco: 6,
  },
  {
    label: "Kaduna Electricity",
    disco: 7,
  },
  {
    label: "Abuja Electricity",
    disco: 8,
  },
  {
    label: "Benin Electricity",
    disco: 9,
  },
  {
    label: "Enugu Electricity",
    disco: 10,
  },
  {
    label: "Yola Electricity",
    disco: 11,
  },
];

export const FREQUENTLY_PURCHASE_ELECTRICITY_BILLS = [
  1000, 2000, 3000, 5000, 50000, 100000,
];

export const EXAMS = [
  {
    label: "WAEC",
    amount: 3400,
    planId: 1,
  },
  {
    label: "NECO",
    amount: 1200,
    planId: 2,
  },
  {
    label: "NABTEB",
    amount: 850,
    planId: 3,
  },
];
