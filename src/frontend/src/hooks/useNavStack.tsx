import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface NavScreen {
  id: string;
  props?: Record<string, unknown>;
}

interface NavStackContextType {
  stack: NavScreen[];
  push: (screen: NavScreen) => void;
  pop: () => void;
  current: NavScreen | null;
  canGoBack: boolean;
}

export const NavStackContext = createContext<NavStackContextType>({
  stack: [],
  push: () => {},
  pop: () => {},
  current: null,
  canGoBack: false,
});

export function useNavStack() {
  return useContext(NavStackContext);
}

export function NavStackProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<NavScreen[]>([]);

  const push = useCallback((screen: NavScreen) => {
    setStack((prev) => [...prev, screen]);
  }, []);

  const pop = useCallback(() => {
    setStack((prev) => prev.slice(0, -1));
  }, []);

  const current = stack.length > 0 ? stack[stack.length - 1] : null;
  const canGoBack = stack.length > 0;

  return (
    <NavStackContext.Provider value={{ stack, push, pop, current, canGoBack }}>
      {children}
    </NavStackContext.Provider>
  );
}
