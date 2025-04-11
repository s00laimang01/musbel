import { availableNetworks, IBuyVtuNetworks } from "@/types";
import mongoose from "mongoose";
import { z } from "zod";

// Schema for validating POST request body
export const createDataPlanSchema = z.object({
  network: z.enum(["mtn", "airtel", "glo", "9mobile"]),
  data: z.string().min(1),
  amount: z.number().positive(),
  availability: z.string().min(1),
  type: z.enum(["COOPERATE GIFTING", "GIFTING", "SME"]),
  planId: z.number().positive(),
  isPopular: z.boolean().default(false),
});

// Form schema with validation
export const formSchema = z.object({
  network: z.enum<IBuyVtuNetworks, ["Mtn", "Airtel", "Glo", "9Mobile"]>(
    ["Mtn", "Airtel", "Glo", "9Mobile"],
    {
      required_error: "Please select a network",
    }
  ),
  data: z.string().min(1, "Data amount is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  availability: z.string().min(1, "Availability is required"),
  type: z.enum(["COOPERATE GIFTING", "GIFTING", "SME"], {
    required_error: "Please select a plan type",
  }),
  planId: z.coerce.number().positive("Plan ID must be positive"),
  isPopular: z.boolean().default(false),
});

/**
 * Schema for validating airtime purchase requests
 */
export const airtimeRequestSchema = z.object({
  pin: z.string().min(4).max(6),
  amount: z.number().positive().min(50), // Assuming minimum airtime amount is 50
  network: z.string(),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters long")
    .max(17),
  byPassValidator: z.boolean().optional().default(false),
});

export const dataRequestSchema = z.object({
  pin: z.string().min(4).max(6),
  _id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid plan ID format",
  }),
  phoneNumber: z.string(),
  byPassValidator: z.boolean().optional().default(false),
});

// Define schema for request validation
export const billPaymentSchema = z.object({
  electricityId: z.string().min(1, "Electricity provider is required"),
  meterNumber: z.string().min(1, "Meter number is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  pin: z.string().min(4, "PIN must be at least 4 characters"),
  byPassValidator: z.boolean().optional().default(false),
});

export const examPurchaseSchema = z.object({
  examId: z.string().min(1, "Exam ID is required"),
  quantity: z.number().int().positive().default(1),
  pin: z.string().min(4, "PIN must be at least 4 characters"),
});

export const signUpSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1, "Full name is required").max(60),
  password: z.string().min(6),
  country: z.enum(["nigeria"]),
  phoneNumber: z.string().min(10).max(15),
});

/**
 * Type for validated airtime request
 */
export type AirtimeRequest = z.infer<typeof airtimeRequestSchema>;
