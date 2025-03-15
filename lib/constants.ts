import {
  availableNetworks,
  meterType,
  PATHS,
  planTypes,
  recentPurchaseNumbers,
} from "@/types";
import z from "zod";
import { CreditCard, GraduationCap, Zap } from "lucide-react";

export const configs = {
  appName: "KINTA SME",
  "X-RAPIDAPI-HOST": process.env["X-RAPIDAPI-HOST"],
  "X-RAPIDAPI-KEY": process.env["X-RAPIDAPI-KEY"],
  FLW_ENCRYPTION_KEY: process.env["FLW_ENCRYPTION_KEY"],
  FLW_PUBK: process.env["FLW_PUBK"],
  FLW_SECK: process.env["FLW_SECK"],
  HOST_EMAIL: process.env["HOST_EMAIL"],
  HOST_EMAIL_PASSWORD: process.env["HOST_EMAIL_PASSWORD"],
  FLW_SECRET_HASH: process.env["FLW_SECRET_HASH"],
  RESEND_API_KEY: process.env["RESEND_API_KEY"],
  BUDPAY_SECRET_KEY: process.env["BUDPAY_SECRET_KEY"],
};

// FORM SCHEMAS
export const signUpSchema = z.object({
  fullName: z.string().min(3, "Full Name is too short"),
  country: z.enum(["nigeria"]),
  phoneNumber: z.string().min(11, "Please use a valid phone number."),
  email: z.string().email(),
  password: z.string().min(6, "Password is too short"),
});

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
    date: new Date().toISOString(),
    network: "mtn",
    number: "07061508325",
  },
  {
    amount: 2000,
    dataPlan: "",
    date: new Date().toISOString(),
    network: "airtel",
    number: "08123164428",
  },
  {
    amount: 3000,
    dataPlan: "",
    date: new Date().toISOString(),
    network: "mtn",
    number: "09130404752",
  },
  {
    amount: 4000,
    dataPlan: "",
    date: new Date().toISOString(),
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

export const DATA_PLANS = [
  {
    planId: "1",
    network: "MTN",
    planType: "SME",
    planName: "1.0GB",
    amount: 620.0,
    validity: "1 Month",
  },
  {
    planId: "2",
    network: "MTN",
    planType: "SME",
    planName: "3.0GB",
    amount: 1860.0,
    validity: "1 Month",
  },
  {
    planId: "3",
    network: "MTN",
    planType: "SME",
    planName: "2.0GB",
    amount: 1240.0,
    validity: "1 Month",
  },
  {
    planId: "5",
    network: "MTN",
    planType: "SME",
    planName: "10.0GB",
    amount: 6200.0,
    validity: "1 Month",
  },
  {
    planId: "6",
    network: "MTN",
    planType: "SME",
    planName: "500MB",
    amount: 310.0,
    validity: "1 Month",
  },
  {
    planId: "7",
    network: "MTN",
    planType: "COOPERATE GIFTING",
    planName: "500MB",
    amount: 134.0,
    validity: "1 Month",
  },
  {
    planId: "8",
    network: "MTN",
    planType: "COOPERATE GIFTING",
    planName: "1.0GB",
    amount: 289.0,
    validity: "1 Month",
  },
  {
    planId: "9",
    network: "MTN",
    planType: "COOPERATE GIFTING",
    planName: "2.0GB",
    amount: 578.0,
    validity: "1 Month",
  },
  {
    planId: "10",
    network: "MTN",
    planType: "COOPERATE GIFTING",
    planName: "3.0GB",
    amount: 867.0,
    validity: "1 Month",
  },
  {
    planId: "11",
    network: "MTN",
    planType: "COOPERATE GIFTING",
    planName: "5.0GB",
    amount: 1445.0,
    validity: "1 Month",
  },
  {
    planId: "12",
    network: "MTN",
    planType: "COOPERATE GIFTING",
    planName: "10.0GB",
    amount: 2890.0,
    validity: "1 Month",
  },
  {
    planId: "13",
    network: "AIRTEL",
    planType: "COOPERATE GIFTING",
    planName: "500MB",
    amount: 297.0,
    validity: "1 Month",
  },
  {
    planId: "14",
    network: "AIRTEL",
    planType: "COOPERATE GIFTING",
    planName: "1.0GB",
    amount: 595.0,
    validity: "1 Month",
  },
  {
    planId: "15",
    network: "AIRTEL",
    planType: "COOPERATE GIFTING",
    planName: "2.0GB",
    amount: 1190.0,
    validity: "1 Month",
  },
  {
    planId: "17",
    network: "AIRTEL",
    planType: "COOPERATE GIFTING",
    planName: "5.0GB",
    amount: 2975.0,
    validity: "1 Month",
  },
  {
    planId: "18",
    network: "AIRTEL",
    planType: "COOPERATE GIFTING",
    planName: "10.0GB",
    amount: 5950.0,
    validity: "1 Month",
  },
  {
    planId: "36",
    network: "9MOBILE",
    planType: "COOPERATE GIFTING",
    planName: "500MB",
    amount: 78.0,
    validity: "1 month",
  },
  {
    planId: "37",
    network: "9MOBILE",
    planType: "COOPERATE GIFTING",
    planName: "1GB",
    amount: 153.0,
    validity: "1 month",
  },
  {
    planId: "38",
    network: "9MOBILE",
    planType: "COOPERATE GIFTING",
    planName: "2GB",
    amount: 306.0,
    validity: "1 month",
  },
  {
    planId: "39",
    network: "9MOBILE",
    planType: "COOPERATE GIFTING",
    planName: "3GB",
    amount: 459.0,
    validity: "1 month",
  },
  {
    planId: "40",
    network: "9MOBILE",
    planType: "COOPERATE GIFTING",
    planName: "5GB",
    amount: 765.0,
    validity: "1 month",
  },
  {
    planId: "41",
    network: "9MOBILE",
    planType: "COOPERATE GIFTING",
    planName: "10GB",
    amount: 1530.0,
    validity: "1 month",
  },
  {
    planId: "42",
    network: "GLO",
    planType: "COOPERATE GIFTING",
    planName: "500MB",
    amount: 210.0,
    validity: "1 month",
  },
  {
    planId: "43",
    network: "GLO",
    planType: "COOPERATE GIFTING",
    planName: "1GB",
    amount: 410.0,
    validity: "1 month",
  },
  {
    planId: "44",
    network: "GLO",
    planType: "COOPERATE GIFTING",
    planName: "2GB",
    amount: 820.0,
    validity: "1 month",
  },
  {
    planId: "45",
    network: "GLO",
    planType: "COOPERATE GIFTING",
    planName: "3GB",
    amount: 1230.0,
    validity: "1 month",
  },
  {
    planId: "46",
    network: "GLO",
    planType: "COOPERATE GIFTING",
    planName: "5GB",
    amount: 2050.0,
    validity: "1 month",
  },
  {
    planId: "47",
    network: "GLO",
    planType: "COOPERATE GIFTING",
    planName: "10GB",
    amount: 4100.0,
    validity: "1 month",
  },
  {
    planId: "48",
    network: "MTN",
    planType: "GIFTING",
    planName: "1GB",
    amount: 240.0,
    validity: "24 hours",
  },
  {
    planId: "49",
    network: "MTN",
    planType: "GIFTING",
    planName: "3.2GB",
    amount: 1020.0,
    validity: "2 DAYS AWOOF",
  },
  {
    planId: "50",
    network: "MTN",
    planType: "GIFTING",
    planName: "15GB",
    amount: 3550.0,
    validity: "30 DAYS AWOOF",
  },
  {
    planId: "51",
    network: "AIRTEL",
    planType: "SME",
    planName: "1GB",
    amount: 305.0,
    validity:
      "7 DAYS AWOOF DATA PLEASE DONT BUY THIS PLAN IF YOU ARE OWING AIRTEL MONEY",
  },
  {
    planId: "52",
    network: "AIRTEL",
    planType: "SME",
    planName: "2GB",
    amount: 610.0,
    validity: "14DAYS AWOOF DONT BUY THIS PLAN IF YOU ARE OWING AIRTEL MONEY",
  },
  {
    planId: "54",
    network: "AIRTEL",
    planType: "SME",
    planName: "4GB",
    amount: 1152.0,
    validity:
      "30 DAYS AWOOF DATA PLEASE DONT BUY THIS PLAN IF YOU ARE OWING AIRTEL MONEY OO",
  },
  {
    planId: "58",
    network: "AIRTEL",
    planType: "GIFTING",
    planName: "1GB",
    amount: 310.0,
    validity:
      "2 DAYS AWOOF DATA PLEASE DONT BUY THIS PLAN IF YOU ARE OWING AIRTEL MONEY",
  },
  {
    planId: "59",
    network: "AIRTEL",
    planType: "GIFTING",
    planName: "2GB",
    amount: 625.0,
    validity:
      "7 DAYS AWOOF DATA PLEASE DONT BUY THIS PLAN IF YOU ARE OWING AIRTEL MONEY",
  },
  {
    planId: "60",
    network: "AIRTEL",
    planType: "GIFTING",
    planName: "3GB",
    amount: 670.0,
    validity:
      "7 DAYS AWOOF DATA PLEASE DONT BUY THIS PLAN IF YOU ARE OWING AIRTEL MONEY OO",
  },
  {
    planId: "61",
    network: "AIRTEL",
    planType: "GIFTING",
    planName: "4GB",
    amount: 1200.0,
    validity:
      "30 DAYS AWOOF DATA PLEASE DONT BUY THIS PLAN IF YOU ARE OWING AIRTEL MONEY OO",
  },
  {
    planId: "62",
    network: "AIRTEL",
    planType: "GIFTING",
    planName: "10GB",
    amount: 3200.0,
    validity:
      "30 DAYS AWOOF DATA PLEASE DONT BUY THIS PLAN IF YOU ARE OWING AIRTEL MONEY OO",
  },
  {
    planId: "63",
    network: "AIRTEL",
    planType: "GIFTING",
    planName: "15GB",
    amount: 3220.0,
    validity:
      "30 DAYS AWOOF DATA PLEASE DONT BUY THIS PLAN IF YOU ARE OWING AIRTEL MONEY OO",
  },
  {
    planId: "64",
    network: "AIRTEL",
    planType: "GIFTING",
    planName: "300MB",
    amount: 170.0,
    validity:
      "2DAYS AWOOF DATA PLEASE DONT BUY THIS PLAN IF YOU ARE OWING AIRTEL MONEY",
  },
  {
    planId: "65",
    network: "AIRTEL",
    planType: "SME",
    planName: "1.5GB",
    amount: 420.0,
    validity:
      "7 DAYS AWOOF DATA PLEASE DONT BUY THIS PLAN IF YOU ARE OWING AIRTEL MONEY OO",
  },
  {
    planId: "67",
    network: "GLO",
    planType: "SME",
    planName: "1GB",
    amount: 230.0,
    validity: "1 DAYS",
  },
  {
    planId: "68",
    network: "GLO",
    planType: "SME",
    planName: "2GB",
    amount: 460.0,
    validity: "2 DAYS",
  },
  {
    planId: "69",
    network: "GLO",
    planType: "SME",
    planName: "3.5GB",
    amount: 690.0,
    validity: "2 DAYS AWOOF DATA",
  },
  {
    planId: "70",
    network: "GLO",
    planType: "SME",
    planName: "15GB",
    amount: 2100.0,
    validity: "7 DAYS",
  },
  {
    planId: "71",
    network: "GLO",
    planType: "GIFTING",
    planName: "1GB",
    amount: 210.0,
    validity: "1 DAY AWOOF DATA",
  },
  {
    planId: "72",
    network: "GLO",
    planType: "GIFTING",
    planName: "2GB",
    amount: 310.0,
    validity: "1 DAY AWOOF DATA",
  },
  {
    planId: "73",
    network: "GLO",
    planType: "GIFTING",
    planName: "3.5GB",
    amount: 510.0,
    validity: "510",
  },
  {
    planId: "74",
    network: "GLO",
    planType: "GIFTING",
    planName: "15GB",
    amount: 2000.0,
    validity: "7 DAYS AWOOF DATA",
  },
  {
    planId: "75",
    network: "AIRTEL",
    planType: "SME",
    planName: "5GB",
    amount: 1310.0,
    validity: "14DAYS AWOOF DONT BUY THIS PLAN IF YOU ARE OWING AIRTEL MONEY",
  },
  {
    planId: "76",
    network: "AIRTEL",
    planType: "SME",
    planName: "20GB",
    amount: 4150.0,
    validity: "30 Days",
  },
  {
    planId: "77",
    network: "AIRTEL",
    planType: "SME",
    planName: "500MB",
    amount: 210.0,
    validity: "14 days",
  },
  {
    planId: "78",
    network: "AIRTEL",
    planType: "GIFTING",
    planName: "1.5GB",
    amount: 450.0,
    validity: "7 DAYS PLEASE DON'T SEND IF THE CUSTOMER IS OWING",
  },
  {
    planId: "80",
    network: "MTN",
    planType: "GIFTING",
    planName: "7GB",
    amount: 3100.0,
    validity: "7 DAYS MTN AWOOF",
  },
  {
    planId: "81",
    network: "MTN",
    planType: "GIFTING",
    planName: "1.5GB",
    amount: 430.0,
    validity: "1 DAY AWOOF DATA",
  },
  {
    planId: "82",
    network: "MTN",
    planType: "GIFTING",
    planName: "5GB",
    amount: 1530.0,
    validity: "7 DAYS MTN AWOOF",
  },
  {
    planId: "83",
    network: "AIRTEL",
    planType: "COOPERATE GIFTING",
    planName: "100MB",
    amount: 150.0,
    validity: "30 days",
  },
  {
    planId: "84",
    network: "AIRTEL",
    planType: "COOPERATE GIFTING",
    planName: "300MB",
    amount: 220.0,
    validity: "30 days",
  },
  {
    planId: "85",
    network: "MTN",
    planType: "GIFTING",
    planName: "1GB",
    amount: 355.0,
    validity: "24 hours and 2 mins call🤙",
  },
];

export const PLAN_TYPES: planTypes[] = ["SME", "GIFTING", "COOPERATE GIFTING"];

export const METER_TYPE: meterType[] = ["postpaid", "prepaid"];

export const networkTypes: Record<availableNetworks, number> = {
  mtn: 1,
  glo: 2,
  airtel: 3,
  "9mobile": 4,
};
