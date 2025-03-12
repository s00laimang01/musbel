import { appProps } from "@/types";
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
});

const App = mongoose.model<appProps>("App", AppSchema);

export { App };
