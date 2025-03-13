"use client";

import { useState, useEffect } from "react";

export function useTimeGreeting() {
  const [message, setMessage] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const updateMessage = () => {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();

    // Format time as HH:MM
    const formattedTime = `${hour.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
    setCurrentTime(formattedTime);

    // Determine message based on time of day
    if (hour >= 5 && hour < 9) {
      // Early morning (5:00 AM - 8:59 AM)
      setMessage("Rise and shine! Start your day with positive energy. ☀️");
    } else if (hour >= 9 && hour < 12) {
      // Morning/Work hours (9:00 AM - 11:59 AM)
      setMessage("Good morning! Time to focus and be productive. 💼");
    } else if (hour >= 12 && hour < 17) {
      // Afternoon (12:00 PM - 4:59 PM)
      setMessage("Afternoon boost! Keep the momentum going. 🚀");
    } else if (hour >= 17 && hour < 21) {
      // Evening (5:00 PM - 8:59 PM)
      setMessage("Evening wind-down! Time to wrap up your day's tasks. 🌇");
    } else {
      // Night (9:00 PM - 4:59 AM)
      setMessage(
        "Late hours! You've worked hard today, get some well-deserved rest. 🌙"
      );
    }
  };

  useEffect(() => {
    // Set message immediately on mount
    updateMessage();

    // Update message every minute
    const intervalId = setInterval(updateMessage, 60000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return { message, currentTime };
}
