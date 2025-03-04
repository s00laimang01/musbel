import { Clock } from "lucide-react";
import Empty from "./empty";

export default function RecentActivity() {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Recent Activity</h2>
      <p className="text-gray-500 text-sm mb-6">
        An overview of the current status of your most recent deliveries.
      </p>

      <Empty />
    </div>
  );
}
