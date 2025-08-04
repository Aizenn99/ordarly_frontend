// src/components/NotificationSoundHandler.jsx

import { useEffect, useRef } from "react";
import { eventBus } from "@/utils/eventBus";

export default function NotificationSoundHandler() {
  const audioRef = useRef(null);

  useEffect(() => {
    // 1️⃣ Load + prime audio once
    const audio = new Audio("/sounds/notification.mp3");
    audio.preload = "auto";
    audioRef.current = audio;

    // Unlock playback on first user click
    const unlock = () => {
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
        })
        .catch(() => {});
      window.removeEventListener("click", unlock);
    };
    window.addEventListener("click", unlock, { once: true });
  }, []);

  useEffect(() => {
    const handler = (updatedNotifications) => {
      // Read your toggles
      const notificationsEnabled =
        JSON.parse(localStorage.getItem("notificationsEnabled")) ?? true;
      const soundEnabled =
        JSON.parse(localStorage.getItem("orderSoundEnabled")) ?? true;

      if (!notificationsEnabled) return;

      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          /* swallow if browser blocks */
        });
      }
    };

    eventBus.on("kot-notification", handler);
    return () => {
      eventBus.off("kot-notification", handler);
    };
  }, []);

  return null; // this component renders nothing
}
