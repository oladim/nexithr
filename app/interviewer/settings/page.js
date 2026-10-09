"use client";

import SettingsHub from "@/components/SettingsHub";

export default function InterviewerSettings() {
  return (
    <SettingsHub
      audience="interviewer"
      profileHref="/interviewer/profile"
      notificationsHref="/interviewer/notifications"
    />
  );
}
