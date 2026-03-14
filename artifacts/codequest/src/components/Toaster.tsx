import { AnimatePresence, motion } from "framer-motion";
import { useToastStore } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, AlertCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col p-4 gap-2 w-full max-w-sm sm:bottom-4 sm:right-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isGamification = toast.type === "gamification";
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={cn(
                "pointer-events-auto flex items-start gap-4 p-4 rounded-xl shadow-2xl border backdrop-blur-xl",
                isGamification 
                  ? "bg-card/80 border-accent/50 shadow-accent/20" 
                  : "bg-card/90 border-border"
              )}
            >
              <div className="mt-1 shrink-0">
                {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {toast.type === "error" && <XCircle className="w-5 h-5 text-red-500" />}
                {toast.type === "default" && <AlertCircle className="w-5 h-5 text-muted-foreground" />}
                {isGamification && <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />}
              </div>
              <div className="flex-1">
                <h3 className={cn("font-semibold", isGamification && "text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500")}>
                  {toast.title}
                </h3>
                {toast.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
