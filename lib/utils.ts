import {
  availableNetworks,
  dataPlan,
  dedicatedAccountNumber,
  flutterwaveWebhook,
  IUser,
  VirtualAccountResponse,
} from "@/types";
import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { configs } from "./constants";
import { Session } from "next-auth";

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

export const validatePhoneNumber = async (phoneNumber: string) => {
  const res = await axios.get<{ is_valid: boolean }>(
    `https://validate-phone-by-api-ninjas.p.rapidapi.com/v1/validatephone?number=${phoneNumber}&country=NG`,
    {
      headers: {
        "x-rapidapi-host": configs["X-RAPIDAPI-HOST"],
        "x-rapidapi-key": configs["X-RAPIDAPI-KEY"],
      },
    }
  );

  return res.data;
};

export const errorMessage = (error: any) => {
  return error.response.data;
};

export const httpStatusResponse = (
  code: number,
  message?: string,
  data?: any,
  _status?: string
) => {
  const status: Record<number, any> = {
    200: {
      status: "success",
      message: message || "Request successful",
      data,
    },
    400: {
      status: "bad request",
      message: message || "An error has occurred on the client side.",
      data,
    },
    401: {
      status: "unauthorized access",
      message:
        message ||
        "You are not authorized to make this request or access this endpoint",
      data,
    },
    404: {
      status: "not found",
      message:
        message ||
        "The resources you are looking for cannot be found or does not exist",
      data,
    },
    409: {
      status: "conflict",
      message:
        message ||
        "The resources you are requesting for is having a conflict with something, please message us if this issue persist",
      data,
    },
    429: {
      status: "too-many-request",
      message:
        message || "Please wait again later, you are sending too many request.",
      data,
    },
    500: {
      status: "server",
      message:
        message ||
        "Sorry, The problem is from our end please try again later or message us if this issue persist, sorry for the inconvenience",
      data,
    },
  };

  const checkCode = Object.keys(status).includes(code + "");

  return checkCode ? status[code] : { status: _status, message, code, data };
};

export const checkIfUserIsAuthenticated = async (session: Session | null) => {
  if (!session) {
    throw new Error("UNAUTHENTICATED: Please signIn to continue.");
  }

  if (session.expires) {
    console.log(session.expires);
  }

  return true;
};

export const restrictPropertyModification = (
  data: object,
  restrictedKeys: string[]
) => {
  const allKeys = Object.keys(data);

  for (const restrictedKey of restrictedKeys) {
    if (allKeys.includes(restrictedKey)) {
      throw new Error(
        "UNAUTHORIZE_ACTION: You are not allow to modify/configure this properties"
      );
    }
  }
};

export const api = axios.create({
  baseURL: "/api/",
});

export interface apiResponse<T = any> {
  status: string;
  message: string;
  data: T;
  code?: string | number;
}

export const getUser = async () => {
  const res = await api.get<apiResponse<IUser>>("/users/me");

  return res.data.data;
};

export const getDedicatedAccount = async () => {
  const res = await api.get<apiResponse<dedicatedAccountNumber>>(
    "/account/me/"
  );

  return res.data.data;
};

export const getInitials = (name = "") => {
  let c = "";

  name.split(" ").map((n) => {
    c += n[0];
  });

  return c;
};

export const createVirtualAccount = async <T = any>(
  email: string,
  tx_ref?: string,
  isPermanent = false,
  amount?: number,
  bvn?: String,
  note?: string,
  meta?: T
) => {
  const payload = {
    email,
    tx_ref,
    is_permanent: isPermanent,
    amount,
    bvn,
    note,
    meta,
  };

  try {
    const res = await axios.post<VirtualAccountResponse>(
      `https://api.flutterwave.com/v3/virtual-account-numbers`,
      payload,
      { headers: { Authorization: `Bearer ${configs.FLW_SECK}` } }
    );

    return res.data.data;
  } catch (error) {
    console.log(error);
  }
};

export const getTransferFee = async (amount: number) => {
  const q = new URLSearchParams({
    amount: amount.toString(),
    currency: "NGN",
    type: "amount",
  });

  const res = await axios.get<
    VirtualAccountResponse<
      [
        {
          currency: string;
          fee_type: string;
          fee: number;
        }
      ]
    >
  >(`https://api.flutterwave.com/v3/transfers/fee?${q}`, {
    headers: { Authorization: `Bearer ${configs.FLW_SECK}` },
  });

  return res.data.data[0];
};

export const getAccountNumber = async (order_ref: string) => {
  console.log({ order_ref });
  const res = await axios.get<VirtualAccountResponse>(
    `https://api.flutterwave.com/v3/virtual-account-numbers/${order_ref}`,
    { headers: { Authorization: `Bearer ${configs.FLW_SECK}` } }
  );

  return res.data.data;
};

export function countdownTime(targetDate: string) {
  let formattedTime;
  const interval = setInterval(() => {
    const now = new Date();
    const target = new Date(targetDate);
    // @ts-ignore
    const difference = target - now; // Time difference in milliseconds

    if (difference <= 0) {
      clearInterval(interval);
      console.log("Countdown complete!");
      return;
    }

    // Convert milliseconds to hours, minutes, and seconds
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, 1000); // Update every second

  return formattedTime;
}

export const verifyTransaction = async (id: string) => {
  const res = await axios.get<flutterwaveWebhook>(
    `https://api.flutterwave.com/v3/transactions/${id}/verify`,
    { headers: { Authorization: `Bearer ${configs.FLW_SECK}` } }
  );

  return res.data.data;
};

export const verifyTransactionWithTxRef = async (tx_ref: string) => {
  const res = await axios.get<flutterwaveWebhook>(
    `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`,
    { headers: { Authorization: `Bearer ${configs.FLW_SECK}` } }
  );

  return res.data.data;
};
