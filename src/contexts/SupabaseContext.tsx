import { createContext, useContext } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 🔹 Typ für den Supabase-Client
interface SupabaseContextType {
  supabase: SupabaseClient;
}

// ✅ Verbindung zu Supabase mit ENV-Variablen
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// ✅ Erstelle den Context mit korrektem Typ
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}

// ✅ Custom Hook mit Fehlerhandling
export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
}
