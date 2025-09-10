import { mmkvPersist } from "@/app/storage/zustandMMKV";
import { create } from "zustand";

interface PaywallState {
  packages: any[];
  setPackages: (packages: any[]) => void;
}

export const usePaywallStore = create<PaywallState>()(
  mmkvPersist(
    (set) => ({
      packages: [],
      setPackages: (packages) => set({ packages }),
    }),
    { name: "paywall-storage" }
  )
);
