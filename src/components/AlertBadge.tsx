"use client";

import type { AlertLevel } from "@/types";
import { ALERT_LEVEL_CONFIG } from "@/types";

interface AlertBadgeProps {
  level: AlertLevel;
  size?: "sm" | "md" | "lg";
}

export function AlertBadge({ level, size = "md" }: AlertBadgeProps) {
  const config = ALERT_LEVEL_CONFIG[level];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium text-white ${sizeClasses[size]}`}
      style={{ backgroundColor: config.color }}
      role="status"
      aria-label={`Niveau d'alerte: ${config.label}`}
    >
      <span aria-hidden="true">{config.emoji}</span>
      {config.label}
    </span>
  );
}
