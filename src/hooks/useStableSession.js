// src/hooks/useStableSession.js
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

/**
 * Hook personalizado que proporciona una sesión más estable
 * Evita cambios frecuentes de estado y mejora la UX
 */
export function useStableSession() {
  const { data: sessionData, status: sessionStatus } = useSession();
  const [stableSession, setStableSession] = useState(null);
  const [stableStatus, setStableStatus] = useState("loading");

  useEffect(() => {
    // Solo actualizar cuando hay cambios significativos
    if (sessionStatus === "loading") {
      setStableStatus("loading");
    } else if (sessionStatus === "authenticated" && sessionData) {
      setStableSession(sessionData);
      setStableStatus("authenticated");
    } else if (sessionStatus === "unauthenticated") {
      setStableSession(null);
      setStableStatus("unauthenticated");
    }
  }, [sessionData, sessionStatus]);

  return {
    data: stableSession,
    status: stableStatus
  };
}