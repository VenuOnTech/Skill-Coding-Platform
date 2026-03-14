import { create } from "zustand";
import { Badge } from "@workspace/api-client-react";

interface CelebrationStore {
  levelUpData: { oldLevel: number; newLevel: number } | null;
  unlockedBadges: Badge[];
  showLevelUp: (oldLevel: number, newLevel: number) => void;
  showBadges: (badges: Badge[]) => void;
  clear: () => void;
}

export const useCelebrationStore = create<CelebrationStore>((set) => ({
  levelUpData: null,
  unlockedBadges: [],
  showLevelUp: (oldLevel, newLevel) => set({ levelUpData: { oldLevel, newLevel } }),
  showBadges: (badges) => set({ unlockedBadges: badges }),
  clear: () => set({ levelUpData: null, unlockedBadges: [] }),
}));
