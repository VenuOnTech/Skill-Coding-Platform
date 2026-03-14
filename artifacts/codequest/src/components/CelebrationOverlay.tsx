import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useCelebrationStore } from "@/hooks/use-celebration";
import { Button } from "./ui";
import { Trophy, ArrowUpCircle } from "lucide-react";

export function triggerConfetti() {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
}

export function CelebrationOverlay() {
  const { levelUpData, unlockedBadges, clear } = useCelebrationStore();

  const isVisible = !!levelUpData || unlockedBadges.length > 0;

  useEffect(() => {
    if (isVisible) {
      triggerConfetti();
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-card border border-border/50 shadow-2xl rounded-3xl p-8 text-center relative overflow-hidden"
          >
            {/* Glow effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

            {levelUpData && (
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
                  <ArrowUpCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-display font-bold text-foreground mb-2">Level Up!</h2>
                <p className="text-muted-foreground mb-6 text-lg">
                  You reached <span className="text-primary font-bold">Level {levelUpData.newLevel}</span>! Keep up the great work.
                </p>
              </div>
            )}

            {unlockedBadges.length > 0 && !levelUpData && (
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/25">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-display font-bold text-foreground mb-2">Badge Unlocked!</h2>
                <div className="flex flex-col gap-4 mt-4 w-full">
                  {unlockedBadges.map((badge) => (
                    <div key={badge.slug} className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border">
                      <div className="text-4xl">{badge.icon}</div>
                      <div className="text-left">
                        <h4 className="font-bold text-foreground">{badge.name}</h4>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={clear} variant="gamified" size="lg" className="w-full mt-8 relative z-10">
              Awesome!
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
