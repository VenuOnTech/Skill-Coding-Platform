import { create } from "zustand";

export type ToastType = "default" | "success" | "error" | "gamification";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id, type: toast.type || "default" }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 5000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = (props: Omit<Toast, "id">) => useToastStore.getState().addToast(props);

export function useToast() {
  const store = useToastStore();
  return {
    toasts: store.toasts,
    toast: (props: Omit<Toast, "id">) => store.addToast(props),
    dismiss: (id: string) => store.removeToast(id),
  };
}
