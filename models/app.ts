import { appProps, availableBanks } from "@/types";
import mongoose from "mongoose";
import { User } from "./users";

const AppSchema: mongoose.Schema<appProps> = new mongoose.Schema({
  lockAccounts: {
    type: [String],
  },
  stopAllTransactions: {
    type: Boolean,
  },
  stopSomeTransactions: {
    type: ["String"],
    enum: ["funding", "airtime", "data", "bill", "recharge-card", "exam"],
  },
  stopAccountCreation: {
    type: Boolean,
    default: false,
  },
  bankAccountToCreateForUsers: {
    type: String,
    enum: ["9PSB", "BANKLY", "PALMPAY", "PROVIDUS", "SAFEHAVEN", "random"] as (
      | availableBanks
      | "random"
    )[],
    default: "random",
  },
});

const App = mongoose.model<appProps>("App", AppSchema);

export { App };
