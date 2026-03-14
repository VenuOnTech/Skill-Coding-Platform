import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(2)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function getLevelProgress(xp: number, level: number) {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
  const currentBase = thresholds[level - 1] || 4500 + ((level - 10) * 1000);
  const nextBase = thresholds[level] || 4500 + ((level - 9) * 1000);
  
  const currentLevelXp = Math.max(0, xp - currentBase);
  const requiredXp = nextBase - currentBase;
  const progress = Math.min(100, Math.max(0, (currentLevelXp / requiredXp) * 100));
  
  return { currentLevelXp, requiredXp, progress };
}
