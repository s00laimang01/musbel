import { Clock } from "lucide-react";
import React from "react";

const Empty = ({
  header = "You have no pending or successful transaction",
  message = "If you have any transaction, they will appear here.",
}: {
  header?: string;
  message?: string;
}) => {
  return (
    <div className="bg-gray-50 rounded-sm p-6 flex items-start gap-4">
      <div className="bg-gray-200 rounded-full p-2">
        <Clock className="h-5 w-5 text-gray-500" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{header}</h3>
        <p className="text-gray-500 text-sm">{message}</p>
      </div>
    </div>
  );
};

export default Empty;
