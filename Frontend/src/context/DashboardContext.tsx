// src/context/DashboardContext.tsx
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Stats = {
  totalWholesalers: number;
  totalSubscribed: number;
  pendingSubscriptions: number;
};

type DashboardContextType = {
  wholesalers: any[];
  subscribed: any[];
  stats: Stats;
  setWholesalers: (w: any[]) => void;
  setSubscribed: (s: any[]) => void;
  setStats: (s: Stats) => void;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [wholesalers, setWholesalers] = useState<any[]>([]);
  const [subscribed, setSubscribed] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalWholesalers: 0,
    totalSubscribed: 0,
    pendingSubscriptions: 0,
  });

  return (
    <DashboardContext.Provider value={{ wholesalers, subscribed, stats, setWholesalers, setSubscribed, setStats }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within DashboardProvider");
  return context;
}