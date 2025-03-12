import { LucideProps } from "lucide-react";
import mongoose from "mongoose";
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
export type dataTypes = string;

export type availableNetworks = "mtn" | "glo" | "airtel" | "9mobile";
export type planTypes = "GIFTING" | "SME" | "COOPERATE GIFTING";

export interface recentPurchaseNumbers {
  number: string;
  network: availableNetworks;
  dataPlan: string;
  amount: number;
  date: string;
  onSelect?: (phoneNumber: string) => void;
}

export interface dataPlan {
  _id?: string;
  network: availableNetworks;
  data: string;
  amount: number;
  type: planTypes;
  availability: string;
  isPopular?: boolean;
  planId: number;
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

export interface userStore {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  getUserFirstName: (fullName: string) => string;
}

// MODELS

export type IUserRole = "user" | "admin";

export interface IUser {
  _id?: string;
  fullName: string;
  phoneNumber: string;
  country: string;
  balance: number;
  auth: {
    email: string;
    password: string;
    transactionPin: string;
  };
  role: IUserRole;
  createdAt?: string;
  updatedAt?: string;
  hasSetPin: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export interface accountDetailsTypes {
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
  accountRef: string;
  expirationDate: string;
}

export interface dedicatedAccountNumber {
  accountDetails: accountDetailsTypes;
  bvn: string;
  user: string;
  hasDedicatedAccountNumber: boolean;
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  order_ref: string;
  flw_ref: string;
}

export interface otp {
  user: mongoose.Schema.Types.ObjectId;
  otp: string;
  createdAt?: string;
  updatedAt?: string;
  expirationTime: Date;
}

export interface VirtualAccountResponse<T = VirtualAccountData> {
  status: string;
  message: string;
  data: T;
}

export interface VirtualAccountData {
  response_code: string;
  response_message: string;
  flw_ref: string;
  order_ref: string;
  account_number: string;
  frequency: string;
  bank_name: string;
  created_at: string;
  expiry_date: string;
  note: string;
  amount?: number;
  tx_ref: string;
}

// TRANSACTIONS

export type transactionStatus = "success" | "failed" | "pending";
export type transactionType =
  | "funding"
  | "airtime"
  | "data"
  | "bill"
  | "recharge-card"
  | "exam";
export type paymentMethod =
  | "dedicatedAccount"
  | "virtualAccount"
  | "ownAccount";

export interface transaction<T = any> {
  amount: number;
  tx_ref: string;
  user: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  status: transactionStatus;
  type: transactionType;
  paymentMethod: paymentMethod;
  accountId?: string;
  meta?: T;
}

export interface recentlyUsedContact<T = any> {
  uid: string;
  type: transactionType;
  createdAt?: string;
  updatedAt?: string;
  lastUsed: string;
  meta?: T;
}

export type meterType = "prepaid" | "postpaid";

export interface electricity {
  _id?: string;
  discoId: string;
  discoName: string;
  logoUrl?: string;
}

// FLUTTERWAVE WEBHOOK

export interface flutterwaveWebhook<T = any> {
  event: "charge.completed";
  data: {
    id: string;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: "NGN";
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: "PIN";
    ip: string;
    narration: string;
    status: "successful" | "failed";
    payment_type: "card";
    created_at: "2020-07-06T19:17:04.000Z";
    account_id: number;
    customer: {
      id: number;
      name: string;
      phone_number: null;
      email: string;
      created_at: string;
    };
    meta?: T;
  };
}

// VERIFYING PAYMENT
export interface VerifyingPaymentProps {
  paymentId: string;
  onSuccess?: () => void;
  onFailure?: () => void;
}

// APP CONFIGS

export interface appProps {
  stopAllTransactions: boolean;
  stopSomeTransactions: transactionType[];
  lockAccounts: string[];
}

// Vending Responses
export interface DataVendingResponse {
  network: string;
  "request-id": string;
  amount: string;
  dataplan: string;
  status: string;
  message: string;
  phone_number: string;
  oldbal: string;
  newbal: number;
  system: string;
  plan_type: string;
  wallet_vending: string;
}

export interface AirtimeVendingResponse {
  network: string;
  "request-id": string;
  amount: number;
  discount: number;
  status: string;
  message: string;
  phone_number: string;
  oldbal: string;
  newbal: number;
  system: string;
  plan_type: string;
  wallet_vending: string;
}

export interface CableSubscriptionResponse {
  cabl_name: string;
  "request-id": string;
  amount: string;
  charges: number;
  status: string;
  message: string;
  iuc: string;
  oldbal: string;
  newbal: number;
  system: string;
  wallet_vending: string;
  plan_name: string;
}

export interface BillPaymentResponse {
  disco_name: string;
  "request-id": string;
  amount: number;
  charges: number;
  status: transactionStatus;
  message: string;
  meter_number: string;
  meter_type: "POSTPAID" | "PREPAID";
  oldbal: string;
  newbal: number;
  system: "API";
  token: string;
  wallet_vending: "wallet";
}

export interface PrintRechargeCard {
  network: availableNetworks;
  "request-id": string;
  amount: number;
  quantity: number;
  status: transactionStatus;
  message: string;
  card_name: string;
  oldbal: string;
  newbal: number;
  system: "API";
  serial: string;
  pin: string;
  load_pin: string;
  check_balance: string;
}

export interface ExamResponse {
  username: string;
  amount: number;
  quantity: number;
  message: string;
  oldbal: string;
  newbal: number;
  date: string;
  status: "success";
  "request-id": string;
  pin: string;
}

export interface MeterVerificationResponse {
  status: "success";
  name: string;
}

export type examType = "waec" | "neco" | "nabteb";

export interface exam {
  _id?: string;
  examType: examType;
  amount: number;
  examId: number;
}
