import {
  createCustomerProps,
  createCustomerResponse,
  createDedicatedVirtualAccountResponse,
  createOneTimeVirtualAccountProps,
  createOneTimeVirtualAccountResponse,
  fetchTransactionResponse,
} from "@/types";
import axios from "axios";

export const budPay = (type: "s2s" | "v2" = "v2") => {
  return axios.create({
    baseURL: `https://api.budpay.com/api/${type}`,
  });
};

export const createOneTimeVirtualAccount = async (
  payload: createOneTimeVirtualAccountProps
) => {
  const response = await budPay(
    "s2s"
  ).post<createOneTimeVirtualAccountResponse>(
    `/banktransfer/initialize/`,
    payload,
    { headers: { Authorization: `Bearer ${process.env.BUDPAY_SECRET_KEY}` } }
  );

  return response.data;
};

export const createCustomer = async (payload: createCustomerProps) => {
  const response = await budPay("v2").post<createCustomerResponse>(
    `/customer/`,
    payload,
    {
      headers: { Authorization: `Bearer ${process.env.BUDPAY_SECRET_KEY}` },
    }
  );

  return response.data;
};

export const createDedicatedVirtualAccount = async (customer: string) => {
  const response = await budPay().post<createDedicatedVirtualAccountResponse>(
    `/dedicated_virtual_account/`,
    {
      customer,
    },
    { headers: { Authorization: `Bearer ${process.env.BUDPAY_SECRET_KEY}` } }
  );

  return response.data;
};

export const verifyTransactionWithBudPay = async (id: string) => {
  try {
    const res = await budPay("s2s").get<fetchTransactionResponse>(
      `/transaction/verify/${id}`,
      { headers: { Authorization: `Bearer ${process.env.BUDPAY_SECRET_KEY}` } }
    );

    return res.data;
  } catch (error) {
    console.log(error);
    return { status: false } as fetchTransactionResponse;
  }
};
